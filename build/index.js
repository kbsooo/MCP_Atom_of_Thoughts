import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';
class AtomOfThoughtsServer {
    atoms = {};
    atomOrder = [];
    verifiedConclusions = [];
    validateAtomData(input) {
        const data = input;
        if (!data.atomId || typeof data.atomId !== 'string') {
            throw new Error('Invalid atomId: must be a string');
        }
        if (!data.content || typeof data.content !== 'string') {
            throw new Error('Invalid content: must be a string');
        }
        if (!data.atomType || typeof data.atomType !== 'string' ||
            !['premise', 'reasoning', 'hypothesis', 'verification', 'conclusion'].includes(data.atomType)) {
            throw new Error('Invalid atomType: must be one of premise, reasoning, hypothesis, verification, conclusion');
        }
        if (!Array.isArray(data.dependencies)) {
            throw new Error('Invalid dependencies: must be an array of atom IDs');
        }
        if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
            throw new Error('Invalid confidence: must be a number between 0 and 1');
        }
        return {
            atomId: data.atomId,
            content: data.content,
            atomType: data.atomType,
            dependencies: data.dependencies,
            confidence: data.confidence,
            created: data.created || Date.now(),
            isVerified: data.isVerified || false,
        };
    }
    formatAtom(atomData) {
        const { atomId, content, atomType, dependencies, confidence, isVerified } = atomData;
        let typeColor;
        let typeSymbol;
        switch (atomType) {
            case 'premise':
                typeColor = chalk.blue;
                typeSymbol = '🔍';
                break;
            case 'reasoning':
                typeColor = chalk.green;
                typeSymbol = '🧠';
                break;
            case 'hypothesis':
                typeColor = chalk.yellow;
                typeSymbol = '💡';
                break;
            case 'verification':
                typeColor = chalk.magenta;
                typeSymbol = '✓';
                break;
            case 'conclusion':
                typeColor = chalk.red;
                typeSymbol = '🏆';
                break;
        }
        const header = typeColor(`${typeSymbol} ${atomType.toUpperCase()}: ${atomId} ${isVerified ? '(✓ 검증됨)' : ''}`);
        const confidenceBar = this.generateConfidenceBar(confidence);
        const dependenciesText = dependencies.length > 0 ? `의존성: ${dependencies.join(', ')}` : '의존성 없음';
        const border = '─'.repeat(Math.max(header.length, content.length, dependenciesText.length) + 4);
        return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${content.padEnd(border.length - 2)} │
│ ${confidenceBar.padEnd(border.length - 2)} │
│ ${dependenciesText.padEnd(border.length - 2)} │
└${border}┘`;
    }
    generateConfidenceBar(confidence) {
        const barLength = 20;
        const filledBars = Math.round(confidence * barLength);
        const emptyBars = barLength - filledBars;
        return `신뢰도: [${chalk.green('█'.repeat(filledBars))}${chalk.gray('░'.repeat(emptyBars))}] ${(confidence * 100).toFixed(0)}%`;
    }
    validateDependencies(dependencies) {
        return dependencies.every(depId => this.atoms[depId] !== undefined);
    }
    updateConfidence(atomId, newConfidence) {
        if (this.atoms[atomId]) {
            this.atoms[atomId].confidence = Math.max(0, Math.min(1, newConfidence));
        }
    }
    verifyAtom(atomId, isVerified) {
        if (this.atoms[atomId]) {
            this.atoms[atomId].isVerified = isVerified;
            if (isVerified && this.atoms[atomId].atomType === 'conclusion') {
                this.verifiedConclusions.push(atomId);
            }
            else if (!isVerified && this.atoms[atomId].atomType === 'conclusion') {
                this.verifiedConclusions = this.verifiedConclusions.filter(id => id !== atomId);
            }
        }
    }
    processAtom(input) {
        try {
            const validatedInput = this.validateAtomData(input);
            // Validate dependencies if they exist
            if (validatedInput.dependencies.length > 0 && !this.validateDependencies(validatedInput.dependencies)) {
                throw new Error('Invalid dependencies: one or more dependency atoms do not exist');
            }
            // Store the atom
            this.atoms[validatedInput.atomId] = validatedInput;
            // Add to order if it's new
            if (!this.atomOrder.includes(validatedInput.atomId)) {
                this.atomOrder.push(validatedInput.atomId);
            }
            // Format and display the atom
            const formattedAtom = this.formatAtom(validatedInput);
            console.error(formattedAtom);
            // Get atoms required for the response
            const dependentAtoms = this.getDependentAtoms(validatedInput.atomId);
            const conflictingAtoms = this.findConflictingAtoms(validatedInput);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            atomId: validatedInput.atomId,
                            atomType: validatedInput.atomType,
                            isVerified: validatedInput.isVerified,
                            confidence: validatedInput.confidence,
                            atomsCount: Object.keys(this.atoms).length,
                            dependentAtoms,
                            conflictingAtoms,
                            verifiedConclusions: this.verifiedConclusions
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                            status: 'failed'
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    // Get atoms that depend on the given atom
    getDependentAtoms(atomId) {
        return Object.keys(this.atoms).filter(id => this.atoms[id].dependencies.includes(atomId));
    }
    // Find atoms that might conflict with this one
    findConflictingAtoms(atom) {
        if (atom.atomType !== 'conclusion' && atom.atomType !== 'hypothesis') {
            return [];
        }
        // For conclusions and hypotheses, look for others with similar types but different content
        return Object.keys(this.atoms).filter(id => {
            const otherAtom = this.atoms[id];
            return id !== atom.atomId &&
                (otherAtom.atomType === 'conclusion' || otherAtom.atomType === 'hypothesis') &&
                otherAtom.content !== atom.content &&
                // Simple heuristic for conflict: share at least one dependency
                atom.dependencies.some(dep => otherAtom.dependencies.includes(dep));
        });
    }
}
const ATOM_OF_THOUGHTS_TOOL = {
    name: "atomofthoughts",
    description: `Atom of Thoughts(AoT)는 복잡한 문제를 독립적이고 재사용 가능한 원자 단위의 사고로 분해하여 문제를 해결하는 도구입니다.
이 도구는 전통적인 순차적 사고 방식과 달리, 사고의 기본 단위인 '원자'들이 서로 의존성을 갖고 구성되어 더 강력한 문제 해결을 가능하게 합니다.

사용해야 하는 경우:
- 복잡한 추론이 필요한 문제 해결
- 여러 관점에서 검증이 필요한 가설 생성
- 정확도가 중요한 문제에서 신뢰도 높은 결론 도출
- 논리적 오류를 최소화해야 하는 작업
- 여러 단계의 검증이 필요한 의사결정

원자 유형:
- premise(전제): 문제 해결을 위한 기본 가정이나 주어진 정보
- reasoning(추론): 다른 원자들을 기반으로 한 논리적 추론 과정
- hypothesis(가설): 가능한 해결책이나 중간 결론에 대한 제안
- verification(검증): 다른 원자(특히 가설)의 유효성을 평가하는 과정
- conclusion(결론): 검증된 가설이나 최종 문제 해결책

매개변수 설명:
- atomId: 원자의 고유 식별자 (예: 'A1', 'H2' 등)
- content: 원자의 실제 내용
- atomType: 원자의 유형 (premise, reasoning, hypothesis, verification, conclusion 중 하나)
- dependencies: 이 원자가 의존하는 다른 원자들의 ID 목록
- confidence: 이 원자의 신뢰도 (0~1 사이의 값)
- isVerified: 이 원자가 검증되었는지 여부

사용 방법:
1. 문제를 이해하고 필요한 전제(premise) 원자들을 정의
2. 전제를 바탕으로 추론(reasoning) 원자 생성
3. 추론을 바탕으로 가설(hypothesis) 원자 생성
4. 가설을 검증(verification)하는 원자 생성
5. 검증된 가설을 바탕으로 결론(conclusion) 원자 도출
6. 필요시 이전 원자들을 수정하거나 새 원자 추가
7. 높은 신뢰도의 결론 원자를 최종 답변으로 제시`,
    inputSchema: {
        type: "object",
        properties: {
            atomId: {
                type: "string",
                description: "원자의 고유 식별자"
            },
            content: {
                type: "string",
                description: "원자의 실제 내용"
            },
            atomType: {
                type: "string",
                enum: ["premise", "reasoning", "hypothesis", "verification", "conclusion"],
                description: "원자의 유형"
            },
            dependencies: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "이 원자가 의존하는 다른 원자들의 ID 목록"
            },
            confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description: "원자의 신뢰도 (0~1 사이)"
            },
            isVerified: {
                type: "boolean",
                description: "원자가 검증되었는지 여부"
            }
        },
        required: ["atomId", "content", "atomType", "dependencies", "confidence"]
    }
};
// sequentialthinking.ts와 같은 패턴으로 서버 인스턴스 생성
const server = new Server({
    name: "atom-of-thoughts",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
const atomServer = new AtomOfThoughtsServer();
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [ATOM_OF_THOUGHTS_TOOL],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "atomofthoughts") {
        return atomServer.processAtom(request.params.arguments);
    }
    return {
        content: [{
                type: "text",
                text: `알 수 없는 도구: ${request.params.name}`
            }],
        isError: true
    };
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Atom of Thoughts MCP Server running on stdio");
}
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
