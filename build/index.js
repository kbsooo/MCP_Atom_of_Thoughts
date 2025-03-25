import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';
class AtomOfThoughtsServer {
    atoms = {};
    atomOrder = [];
    verifiedConclusions = [];
    decompositionStates = {};
    maxDepth = 5; // Default maximum depth
    currentDecompositionId = null;
    constructor(maxDepth) {
        if (maxDepth !== undefined && maxDepth > 0) {
            this.maxDepth = maxDepth;
        }
    }
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
            depth: data.depth,
        };
    }
    formatAtom(atomData) {
        const { atomId, content, atomType, dependencies, confidence, isVerified, depth } = atomData;
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
        const depthInfo = depth !== undefined ? ` [Depth: ${depth}/${this.maxDepth}]` : '';
        const header = typeColor(`${typeSymbol} ${atomType.toUpperCase()}: ${atomId}${depthInfo} ${isVerified ? '(✓ Verified)' : ''}`);
        const confidenceBar = this.generateConfidenceBar(confidence);
        const dependenciesText = dependencies.length > 0 ? `Dependencies: ${dependencies.join(', ')}` : 'No dependencies';
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
        return `Confidence: [${chalk.green('█'.repeat(filledBars))}${chalk.gray('░'.repeat(emptyBars))}] ${(confidence * 100).toFixed(0)}%`;
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
            // Trigger contraction if a verification atom verifies a hypothesis
            if (isVerified && this.atoms[atomId].atomType === 'verification') {
                const verifiedHypothesisIds = this.atoms[atomId].dependencies.filter(depId => this.atoms[depId] && this.atoms[depId].atomType === 'hypothesis');
                if (verifiedHypothesisIds.length > 0) {
                    // Mark the hypotheses as verified
                    verifiedHypothesisIds.forEach(hypId => {
                        this.atoms[hypId].isVerified = true;
                    });
                    // Check if this should trigger a contraction
                    this.checkForContraction(verifiedHypothesisIds);
                }
            }
        }
    }
    // New method for decomposition
    startDecomposition(atomId) {
        if (!this.atoms[atomId]) {
            throw new Error(`Atom with ID ${atomId} not found`);
        }
        // Generate a unique ID for this decomposition
        const decompositionId = `decomp_${Date.now()}`;
        this.decompositionStates[decompositionId] = {
            originalAtomId: atomId,
            subAtoms: [],
            isCompleted: false
        };
        this.currentDecompositionId = decompositionId;
        console.error(chalk.cyan(`🔍 Starting decomposition of atom ${atomId} (ID: ${decompositionId})`));
        return decompositionId;
    }
    // Add a sub-atom to an ongoing decomposition
    addToDecomposition(decompositionId, atomId) {
        if (!this.decompositionStates[decompositionId]) {
            throw new Error(`Decomposition with ID ${decompositionId} not found`);
        }
        if (this.decompositionStates[decompositionId].isCompleted) {
            throw new Error(`Decomposition ${decompositionId} is already completed`);
        }
        if (!this.atoms[atomId]) {
            throw new Error(`Atom with ID ${atomId} not found`);
        }
        // Calculate depth for the new atom
        const parentDepth = this.atoms[this.decompositionStates[decompositionId].originalAtomId].depth || 0;
        this.atoms[atomId].depth = parentDepth + 1;
        // Check if we've hit the maximum depth
        if (this.atoms[atomId].depth >= this.maxDepth) {
            console.error(chalk.yellow(`⚠️ Maximum depth ${this.maxDepth} reached with atom ${atomId}`));
        }
        this.decompositionStates[decompositionId].subAtoms.push(atomId);
        console.error(chalk.cyan(`➕ Added atom ${atomId} to decomposition ${decompositionId}`));
        return true;
    }
    // Complete a decomposition
    completeDecomposition(decompositionId) {
        if (!this.decompositionStates[decompositionId]) {
            throw new Error(`Decomposition with ID ${decompositionId} not found`);
        }
        this.decompositionStates[decompositionId].isCompleted = true;
        if (this.currentDecompositionId === decompositionId) {
            this.currentDecompositionId = null;
        }
        console.error(chalk.green(`✅ Completed decomposition ${decompositionId}`));
        return true;
    }
    // Contraction mechanism
    checkForContraction(verifiedAtomIds) {
        // Find decomposition states that have these atoms as sub-atoms
        for (const [decompId, state] of Object.entries(this.decompositionStates)) {
            if (state.isCompleted &&
                verifiedAtomIds.some(id => state.subAtoms.includes(id)) &&
                this.areAllSubAtomsVerified(state.subAtoms)) {
                // All sub-atoms are verified, perform contraction
                this.performContraction(decompId);
            }
        }
    }
    areAllSubAtomsVerified(atomIds) {
        return atomIds.every(id => this.atoms[id] && this.atoms[id].isVerified);
    }
    performContraction(decompositionId) {
        const state = this.decompositionStates[decompositionId];
        if (!state)
            return;
        const originalAtom = this.atoms[state.originalAtomId];
        if (!originalAtom)
            return;
        // Calculate combined confidence from sub-atoms
        const subAtomConfidences = state.subAtoms.map(id => this.atoms[id]?.confidence || 0);
        const averageConfidence = subAtomConfidences.reduce((sum, conf) => sum + conf, 0) / subAtomConfidences.length;
        // Mark the original atom as verified with the calculated confidence
        originalAtom.confidence = averageConfidence;
        originalAtom.isVerified = true;
        console.error(chalk.magenta(`🔄 Contracted decomposition ${decompositionId} back to atom ${state.originalAtomId} with confidence ${(averageConfidence * 100).toFixed(0)}%`));
        // If the contracted atom is a hypothesis and is verified with high confidence, 
        // we might want to automatically create a conclusion based on it
        if (originalAtom.atomType === 'hypothesis' && originalAtom.confidence >= 0.8) {
            this.suggestConclusion(originalAtom);
        }
    }
    suggestConclusion(verifiedHypothesis) {
        // Create a new conclusion atom based on the verified hypothesis
        const conclusionId = `C${Object.keys(this.atoms).filter(id => id.startsWith('C')).length + 1}`;
        const conclusionAtom = {
            atomId: conclusionId,
            content: `Based on verified hypothesis: ${verifiedHypothesis.content}`,
            atomType: 'conclusion',
            dependencies: [verifiedHypothesis.atomId],
            confidence: verifiedHypothesis.confidence * 0.9, // Slightly lower confidence for the derived conclusion
            created: Date.now(),
            isVerified: false,
            depth: verifiedHypothesis.depth, // Same depth as the hypothesis
        };
        this.atoms[conclusionId] = conclusionAtom;
        this.atomOrder.push(conclusionId);
        console.error(chalk.green(`🏆 Suggested conclusion ${conclusionId} based on verified hypothesis ${verifiedHypothesis.atomId}`));
        return conclusionId;
    }
    // Check if we should automatically terminate based on depth or verified conclusions
    shouldTerminate() {
        // Check if we have any atoms at max depth
        const atMaxDepth = Object.values(this.atoms).some(atom => atom.depth !== undefined && atom.depth >= this.maxDepth);
        // Check if we have any verified conclusions with high confidence
        const hasStrongConclusion = this.verifiedConclusions.some(id => this.atoms[id] && this.atoms[id].confidence >= 0.9);
        return atMaxDepth || hasStrongConclusion;
    }
    // Get the termination status and reason
    getTerminationStatus() {
        const atMaxDepth = Object.values(this.atoms).some(atom => atom.depth !== undefined && atom.depth >= this.maxDepth);
        const hasStrongConclusion = this.verifiedConclusions.some(id => this.atoms[id] && this.atoms[id].confidence >= 0.9);
        if (atMaxDepth && hasStrongConclusion) {
            return {
                shouldTerminate: true,
                reason: 'Maximum depth reached and strong conclusion found'
            };
        }
        else if (atMaxDepth) {
            return {
                shouldTerminate: true,
                reason: 'Maximum depth reached'
            };
        }
        else if (hasStrongConclusion) {
            return {
                shouldTerminate: true,
                reason: 'Strong conclusion found'
            };
        }
        else {
            return {
                shouldTerminate: false,
                reason: 'Continue reasoning'
            };
        }
    }
    // Get the best conclusion if we should terminate
    getBestConclusion() {
        if (this.verifiedConclusions.length === 0)
            return null;
        // Sort by confidence and return the highest
        const sortedConclusions = [...this.verifiedConclusions]
            .map(id => this.atoms[id])
            .filter(atom => atom !== undefined)
            .sort((a, b) => b.confidence - a.confidence);
        return sortedConclusions[0] || null;
    }
    processAtom(input) {
        try {
            const validatedInput = this.validateAtomData(input);
            // Validate dependencies if they exist
            if (validatedInput.dependencies.length > 0 && !this.validateDependencies(validatedInput.dependencies)) {
                throw new Error('Invalid dependencies: one or more dependency atoms do not exist');
            }
            // Set depth based on dependencies if not specified
            if (validatedInput.depth === undefined) {
                const depthsOfDependencies = validatedInput.dependencies
                    .map(depId => (this.atoms[depId]?.depth !== undefined ? this.atoms[depId].depth : 0))
                    .filter(depth => depth !== undefined);
                validatedInput.depth = depthsOfDependencies.length > 0
                    ? Math.max(...depthsOfDependencies) + 1
                    : 0;
            }
            // Check if this would exceed max depth
            if (validatedInput.depth > this.maxDepth) {
                console.error(chalk.yellow(`⚠️ Warning: Atom ${validatedInput.atomId} exceeds maximum depth ${this.maxDepth}`));
            }
            // Store the atom
            this.atoms[validatedInput.atomId] = validatedInput;
            // Add to order if it's new
            if (!this.atomOrder.includes(validatedInput.atomId)) {
                this.atomOrder.push(validatedInput.atomId);
            }
            // Automatically add to current decomposition if there is one
            if (this.currentDecompositionId) {
                try {
                    this.addToDecomposition(this.currentDecompositionId, validatedInput.atomId);
                }
                catch (e) {
                    console.error(`Could not add atom to current decomposition: ${e.message}`);
                }
            }
            // Format and display the atom
            const formattedAtom = this.formatAtom(validatedInput);
            console.error(formattedAtom);
            // If it's a verification atom that verifies something, process it
            if (validatedInput.atomType === 'verification' && validatedInput.isVerified) {
                validatedInput.dependencies.forEach(depId => {
                    if (this.atoms[depId]) {
                        this.verifyAtom(depId, true);
                    }
                });
            }
            // Check for termination
            const terminationStatus = this.getTerminationStatus();
            let bestConclusion = null;
            if (terminationStatus.shouldTerminate) {
                bestConclusion = this.getBestConclusion();
                console.error(chalk.red(`🛑 Termination condition met: ${terminationStatus.reason}`));
                if (bestConclusion) {
                    console.error(chalk.green(`🏆 Best conclusion: ${bestConclusion.atomId} - ${bestConclusion.content}`));
                }
            }
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
                            depth: validatedInput.depth,
                            atomsCount: Object.keys(this.atoms).length,
                            dependentAtoms,
                            conflictingAtoms,
                            verifiedConclusions: this.verifiedConclusions,
                            terminationStatus,
                            bestConclusion: bestConclusion ? {
                                atomId: bestConclusion.atomId,
                                content: bestConclusion.content,
                                confidence: bestConclusion.confidence
                            } : null,
                            currentDecomposition: this.currentDecompositionId
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
// Creating a lightweight version of the AtomOfThoughtsServer
class AtomOfThoughtsLightServer extends AtomOfThoughtsServer {
    constructor() {
        // Lower max depth for faster processing
        super(3);
    }
    // Override to simplify the verification process
    processAtom(input) {
        try {
            const validatedInput = this.validateAtomData(input);
            // Store the atom
            this.atoms[validatedInput.atomId] = validatedInput;
            // Add to order if it's new
            if (!this.atomOrder.includes(validatedInput.atomId)) {
                this.atomOrder.push(validatedInput.atomId);
            }
            // Format and display the atom with simplified output
            const formattedAtom = this.formatAtom(validatedInput);
            console.error(formattedAtom);
            // Quick verification - if verification atom, immediately verify dependencies
            if (validatedInput.atomType === 'verification' && validatedInput.isVerified) {
                validatedInput.dependencies.forEach(depId => {
                    if (this.atoms[depId]) {
                        this.verifyAtom(depId, true);
                    }
                });
            }
            // Faster conclusion suggestion - if hypothesis with high confidence, suggest conclusion immediately
            if (validatedInput.atomType === 'hypothesis' && validatedInput.confidence >= 0.8) {
                this.suggestConclusion(validatedInput);
            }
            // Simplified termination check
            const shouldTerminate = this.shouldTerminate();
            const bestConclusion = shouldTerminate ? this.getBestConclusion() : null;
            // Basic response with less processing
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            atomId: validatedInput.atomId,
                            atomType: validatedInput.atomType,
                            isVerified: validatedInput.isVerified,
                            confidence: validatedInput.confidence,
                            atomsCount: Object.keys(this.atoms).length,
                            bestConclusion: bestConclusion ? {
                                atomId: bestConclusion.atomId,
                                content: bestConclusion.content,
                                confidence: bestConclusion.confidence
                            } : null
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
}
const AOT_TOOL = {
    name: "AoT",
    description: `Atom of Thoughts (AoT) is a tool for solving complex problems by decomposing them into independent, reusable atomic units of thought.
Unlike traditional sequential thinking, this tool enables more powerful problem solving by allowing atomic units of thought to form dependencies with each other.

When to use:
- Solving problems requiring complex reasoning
- Generating hypotheses that need verification from multiple perspectives
- Deriving high-confidence conclusions in scenarios where accuracy is crucial
- Minimizing logical errors in critical tasks
- Decision-making requiring multiple verification steps

Atom types:
- premise: Basic assumptions or given information for problem solving
- reasoning: Logical reasoning process based on other atoms
- hypothesis: Proposed solutions or intermediate conclusions
- verification: Process to evaluate the validity of other atoms (especially hypotheses)
- conclusion: Verified hypotheses or final problem solutions

Parameter descriptions:
- atomId: Unique identifier for the atom (e.g., 'A1', 'H2')
- content: Actual content of the atom
- atomType: Type of atom (one of: premise, reasoning, hypothesis, verification, conclusion)
- dependencies: List of IDs of other atoms this atom depends on
- confidence: Confidence level of this atom (value between 0-1)
- isVerified: Whether this atom has been verified
- depth: Depth level of this atom (in the decomposition-contraction process)

Additional features:
1. Decomposition-Contraction mechanism: 
   - Decompose atoms into smaller sub-atoms and contract back after verification
   - startDecomposition(atomId): Start atom decomposition
   - addToDecomposition(decompositionId, atomId): Add sub-atom to decomposition
   - completeDecomposition(decompositionId): Complete decomposition process

2. Automatic termination mechanism:
   - Automatically terminate when reaching maximum depth or finding high-confidence conclusion
   - getTerminationStatus(): Return termination status and reason
   - getBestConclusion(): Return highest confidence conclusion

Usage method:
1. Understand the problem and define necessary premise atoms
2. Create reasoning atoms based on premises
3. Create hypothesis atoms based on reasoning
4. Create verification atoms to verify hypotheses
5. Derive conclusion atoms based on verified hypotheses
6. Use atom decomposition to explore deeper when necessary
7. Present the high-confidence conclusion atom as the final answer`,
    inputSchema: {
        type: "object",
        properties: {
            atomId: {
                type: "string",
                description: "Unique identifier for the atom"
            },
            content: {
                type: "string",
                description: "Actual content of the atom"
            },
            atomType: {
                type: "string",
                enum: ["premise", "reasoning", "hypothesis", "verification", "conclusion"],
                description: "Type of atom"
            },
            dependencies: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "List of IDs of other atoms this atom depends on"
            },
            confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description: "Confidence level of this atom (value between 0-1)"
            },
            isVerified: {
                type: "boolean",
                description: "Whether this atom has been verified"
            },
            depth: {
                type: "number",
                description: "Depth level of this atom in the decomposition-contraction mechanism"
            }
        },
        required: ["atomId", "content", "atomType", "dependencies", "confidence"]
    }
};
const AOT_LIGHT_TOOL = {
    name: "AoT-light",
    description: `A lightweight version of Atom of Thoughts (AoT) designed for faster processing and quicker results.
This streamlined version sacrifices some depth of analysis for speed, making it ideal for time-sensitive reasoning tasks.

When to use:
- Quick brainstorming sessions requiring atomic thought organization
- Time-sensitive problem solving where speed is prioritized over exhaustive analysis
- Simpler reasoning tasks that don't require deep decomposition
- Initial exploration before using the full AoT for deeper analysis
- Learning or demonstration purposes where response time is important

Key differences from full AoT:
- Lower maximum depth (3 instead of 5) for faster processing
- Simplified verification process
- Immediate conclusion suggestion for high-confidence hypotheses
- Reduced computational overhead and response payload
- Optimized for speed rather than exhaustive analysis

Atom types and parameters are the same as the full AoT tool.`,
    inputSchema: {
        type: "object",
        properties: {
            atomId: {
                type: "string",
                description: "Unique identifier for the atom"
            },
            content: {
                type: "string",
                description: "Actual content of the atom"
            },
            atomType: {
                type: "string",
                enum: ["premise", "reasoning", "hypothesis", "verification", "conclusion"],
                description: "Type of atom"
            },
            dependencies: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "List of IDs of other atoms this atom depends on"
            },
            confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description: "Confidence level of this atom (value between 0-1)"
            },
            isVerified: {
                type: "boolean",
                description: "Whether this atom has been verified"
            },
            depth: {
                type: "number",
                description: "Depth level of this atom (optional, defaults to 0)"
            }
        },
        required: ["atomId", "content", "atomType", "dependencies", "confidence"]
    }
};
// Command handler to expose decomposition-contraction functionality
const ATOM_COMMANDS_TOOL = {
    name: "atomcommands",
    description: `A command tool to control the decomposition-contraction mechanism and automatic termination of Atom of Thoughts.
  
Use this tool to access advanced features of AoT:

1. Decomposition (decompose): Decompose a specified atom into smaller sub-atoms
2. Complete decomposition (complete_decomposition): Complete an ongoing decomposition process
3. Check termination status (termination_status): Check the termination status of the current AoT process
4. Get best conclusion (best_conclusion): Get the verified conclusion with the highest confidence
5. Change settings (set_max_depth): Change the maximum depth limit

Command descriptions:
- command: Command to execute (decompose, complete_decomposition, termination_status, best_conclusion, set_max_depth)
- atomId: Atom ID to use with the command (only required for decompose command)
- decompositionId: ID of the decomposition process (only required for complete_decomposition command)
- maxDepth: Maximum depth value to set (only required for set_max_depth command)`,
    inputSchema: {
        type: "object",
        properties: {
            command: {
                type: "string",
                enum: ["decompose", "complete_decomposition", "termination_status", "best_conclusion", "set_max_depth"],
                description: "Command to execute"
            },
            atomId: {
                type: "string",
                description: "Atom ID to use with the command"
            },
            decompositionId: {
                type: "string",
                description: "ID of the decomposition process to complete"
            },
            maxDepth: {
                type: "number",
                description: "Maximum depth value to set"
            }
        },
        required: ["command"]
    }
};
// Server setup
const server = new Server({
    name: "atom-of-thoughts",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
const atomServer = new AtomOfThoughtsServer();
const atomLightServer = new AtomOfThoughtsLightServer();
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [AOT_TOOL, AOT_LIGHT_TOOL, ATOM_COMMANDS_TOOL],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "AoT") {
        return atomServer.processAtom(request.params.arguments);
    }
    else if (request.params.name === "AoT-light") {
        return atomLightServer.processAtom(request.params.arguments);
    }
    else if (request.params.name === "atomcommands") {
        try {
            const params = request.params.arguments;
            const command = params.command;
            let result = { status: 'error', message: 'Unknown command' };
            switch (command) {
                case 'decompose':
                    const atomId = params.atomId;
                    if (!atomId)
                        throw new Error('atomId is required for decompose command');
                    const decompositionId = atomServer.startDecomposition(atomId);
                    result = {
                        status: 'success',
                        command: 'decompose',
                        decompositionId,
                        message: `Started decomposition of atom ${atomId}`
                    };
                    break;
                case 'complete_decomposition':
                    const decompId = params.decompositionId;
                    if (!decompId)
                        throw new Error('decompositionId is required for complete_decomposition command');
                    const completed = atomServer.completeDecomposition(decompId);
                    result = {
                        status: 'success',
                        command: 'complete_decomposition',
                        completed,
                        message: `Completed decomposition ${decompId}`
                    };
                    break;
                case 'termination_status':
                    const status = atomServer.getTerminationStatus();
                    result = {
                        status: 'success',
                        command: 'termination_status',
                        ...status
                    };
                    break;
                case 'best_conclusion':
                    const bestConclusion = atomServer.getBestConclusion();
                    result = {
                        status: 'success',
                        command: 'best_conclusion',
                        conclusion: bestConclusion ? {
                            atomId: bestConclusion.atomId,
                            content: bestConclusion.content,
                            confidence: bestConclusion.confidence
                        } : null
                    };
                    break;
                case 'set_max_depth':
                    const maxDepth = params.maxDepth;
                    if (typeof maxDepth !== 'number' || maxDepth <= 0)
                        throw new Error('maxDepth must be a positive number');
                    atomServer.maxDepth = maxDepth;
                    result = {
                        status: 'success',
                        command: 'set_max_depth',
                        maxDepth,
                        message: `Maximum depth set to ${maxDepth}`
                    };
                    break;
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: 'error',
                            error: error instanceof Error ? error.message : String(error)
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    return {
        content: [{
                type: "text",
                text: `Unknown tool: ${request.params.name}`
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
