# Atom of Thoughts (AoT)

A Model Context Protocol (MCP) server implementation of Atom of Thoughts, a decomposition-based reasoning framework.

> **Note**: This implementation is based on the research paper ["Atom of Thoughts for Markov LLM Test-Time Scaling"](https://arxiv.org/abs/2502.12018) (Teng et al., 2025).

<a href="https://glama.ai/mcp/servers/@kbsooo/MCP_Atom_of_Thoughts">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@kbsooo/MCP_Atom_of_Thoughts/badge" />
</a>

[MCP.so](https://mcp.so/server/atom-of-thoughts/kbsooo)

[한국어 설명](https://github.com/kbsooo/MCP_Atom_of_Thoughts?tab=readme-ov-file#%ED%95%9C%EA%B5%AD%EC%96%B4-%EC%84%A4%EB%AA%85)

## English Documentation

This repository implements Atom of Thoughts (AoT), a decomposition-based reasoning framework, as a Model Context Protocol (MCP) server. This implementation is based on the concepts presented in the paper ["Atom of Thoughts for Markov LLM Test-Time Scaling"](https://arxiv.org/abs/2502.12018) (Teng et al., 2025).

### Available Tools

Two main tools are provided:

1. **AoT (Full Version)**: A complete Atom of Thoughts tool with full capabilities for deep analysis and complex problem solving.
2. **AoT-light (Lightweight Version)**: A streamlined version optimized for faster processing and quicker results.

### AoT-light: Lightweight Version

AoT-light is designed for faster processing in time-sensitive situations:

- **Key Features**:
  - Lower maximum depth (3 instead of 5) for faster processing
  - Simplified verification process
  - Immediate conclusion suggestion for high-confidence hypotheses
  - Reduced computational overhead and response payload
  - Optimized for speed rather than exhaustive analysis

- **Use Cases**:
  - Quick brainstorming sessions requiring atomic thought organization
  - Time-sensitive problem solving where speed is prioritized over exhaustive analysis
  - Simpler reasoning tasks that don't require deep decomposition
  - Initial exploration before using the full AoT for deeper analysis
  - Learning or demonstration purposes where response time is important

### Use Cases

Atom of Thoughts is effective in the following scenarios:
- Solving problems requiring complex reasoning
- Generating hypotheses that need verification from multiple perspectives
- Deriving high-confidence conclusions in scenarios where accuracy is crucial
- Minimizing logical errors in critical tasks
- Decision-making requiring multiple verification steps

### Atom Types

AoT uses five types of atoms:

1. **premise**: Basic assumptions or given information for problem solving
2. **reasoning**: Logical reasoning process based on other atoms
3. **hypothesis**: Proposed solutions or intermediate conclusions
4. **verification**: Process to evaluate the validity of other atoms (especially hypotheses)
5. **conclusion**: Verified hypotheses or final problem solutions

### Core Features

#### 1. Decomposition-Contraction Mechanism

A mechanism to decompose atoms into smaller sub-atoms and contract them back after verification.

- **Decomposition**: Breaking complex atoms into smaller sub-atoms.
  - `startDecomposition(atomId)`: Start atom decomposition
  - `addToDecomposition(decompositionId, atomId)`: Add sub-atom to decomposition
  - `completeDecomposition(decompositionId)`: Complete decomposition process

- **Contraction**: Contract back to the original atom once all sub-atoms are verified.
  - Calculate confidence of the original atom based on sub-atoms' confidence levels
  - Automatically suggest conclusions for high-confidence verified hypotheses

#### 2. Automatic Termination Mechanism

- Automatically terminates when reaching maximum depth or finding a high-confidence conclusion.
- `getTerminationStatus()`: Return current termination status and reason
- `getBestConclusion()`: Return the conclusion with highest confidence

### Parameter Descriptions

- **atomId**: Unique identifier for the atom (e.g., 'A1', 'H2')
- **content**: Actual content of the atom
- **atomType**: Type of atom (one of: premise, reasoning, hypothesis, verification, conclusion)
- **dependencies**: List of IDs of other atoms this atom depends on
- **confidence**: Confidence level of this atom (value between 0-1)
- **isVerified**: Whether this atom has been verified
- **depth**: Depth level of this atom in the decomposition-contraction process

### Usage Method

1. Understand the problem and define necessary premise atoms
2. Create reasoning atoms based on premises
3. Create hypothesis atoms based on reasoning
4. Create verification atoms to verify hypotheses
5. Derive conclusion atoms based on verified hypotheses
6. Use atom decomposition to explore deeper when necessary
7. Present the high-confidence conclusion atom as the final answer

### Comparing Sequential Thinking and Atom of Thoughts (More Testing Needed)

After applying both thinking tools to the same topic, the following differences and performance characteristics were observed:

#### Structural Differences

**Sequential Thinking:**
- Linear thinking process: progresses sequentially from one thought to the next
- Predicts the total number of thoughts in advance
- Each thinking stage is built upon previous stages

**Atom of Thoughts:**
- Non-linear, network structure: multiple thought units (atoms) interconnect with dependencies
- Forms systematic structure according to atom types (premise, reasoning, hypothesis, verification, conclusion)
- Explicitly evaluates the confidence level of each atom

#### Comparative Strengths

**Sequential Thinking Strengths:**
- Intuitive flow: similar to natural human thinking processes
- Simplicity: simple structure allows quick application to straightforward problems
- Flexibility: can modify previous stages or change direction during the thinking process

**Atom of Thoughts Strengths:**
- Confidence evaluation: explicitly measures the confidence of each thought to improve conclusion validity
- Verification process: evaluates hypotheses through systematic verification stages
- Dependency tracking: clearly tracks which premises or reasoning influenced specific conclusions
- Parallel processing: can consider multiple thought atoms simultaneously

#### Efficiency and Accuracy

**Efficiency:**
- Sequential Thinking: more efficient for simple problems, with faster progression of thought
- Atom of Thoughts: more efficient for complex problems, but has initial overhead in building systematic structures

**Accuracy:**
- Sequential Thinking: possibility of error accumulation from previous stages as the thinking process deepens
- Atom of Thoughts: reduced error possibility through verification stages and confidence assessment, leading to more reliable conclusions

#### Suitability by Purpose

**Cases Suitable for Sequential Thinking:**
- Simple to moderately complex problems
- Time-constrained situations
- When natural storytelling or explanation is needed

**Cases Suitable for Atom of Thoughts:**
- Highly complex problems
- Situations where accuracy and reliability are crucial
- Hypotheses requiring verification from multiple perspectives
- Reasoning with complex dependency relationships

#### Conclusion
Both tools can contribute to improving artificial intelligence's reasoning abilities, but the appropriate tool varies depending on the nature of the problem and requirements. Sequential Thinking is useful when intuitive and quick thinking processes are needed, while Atom of Thoughts is more suitable for complex problems requiring systematic verification and high reliability.

### Command Tool (atomcommands)

A command tool to control the decomposition-contraction mechanism and automatic termination of Atom of Thoughts.

**Available Commands**:
1. **decompose**: Decompose a specified atom into smaller sub-atoms
   - Required parameter: `atomId`
2. **complete_decomposition**: Complete an ongoing decomposition process
   - Required parameter: `decompositionId`
3. **termination_status**: Check the termination status of the current AoT process
4. **best_conclusion**: Get the verified conclusion with the highest confidence
5. **set_max_depth**: Change the maximum depth limit
   - Required parameter: `maxDepth`

### MCP Server Configuration

To use the Atom of Thoughts MCP server, you need to register it in your Claude Desktop or Cline MCP settings. Here is an example configuration:

```json
{ 
  "mcpServers": { 
    "atom-of-thoughts": { 
      "command": "node", 
      "args": ["/ABSOLUTE/PATH/TO/PARENT/FOLDER/atom-of-thoughts/build/index.js"], 
      "disabled": false, 
      "autoApprove": [] 
    } 
  } 
}
```

Replace `/ABSOLUTE/PATH/TO/PARENT/FOLDER` with the actual absolute path to the project on your system. After saving the configuration, restart Claude Desktop or Cline to use the Atom of Thoughts MCP server.

For detailed implementation and code-level documentation, please refer to the source code in this repository.

## 한국어 설명

### Atom of Thoughts란?

Atom of Thoughts(AoT)는 복잡한 문제를 독립적이고 재사용 가능한 원자 단위의 사고로 분해하여 문제를 해결하는 도구입니다. 이 도구는 전통적인 순차적 사고 방식과 달리, 사고의 기본 단위인 '원자'들이 서로 의존성을 갖고 구성되어 더 강력한 문제 해결을 가능하게 합니다. 이 구현은 "Atom of Thoughts for Markov LLM Test-Time Scaling"(Teng et al., 2025) 논문의 개념을 기반으로 합니다.

### 제공되는 도구

현재 다음과 같은 두 가지 주요 도구가 제공됩니다:

1. **AoT (전체 버전)**: 심층적인 분석과 복잡한 문제 해결을 위한 완전한 기능을 갖춘 Atom of Thoughts 도구입니다.
2. **AoT-light (경량 버전)**: 더 빠른 처리와 신속한 결과를 위해 최적화된 경량 버전입니다.

### AoT-light: 경량 버전

AoT-light는 시간이 중요한 상황에서 더 빠른 처리를 위해 설계된 경량 버전입니다:

- **주요 특징**:
  - 낮은 최대 깊이 (5 대신 3) 설정으로 빠른 처리
  - 간소화된 검증 프로세스
  - 높은 신뢰도의 가설에 대한 즉각적인 결론 제안
  - 축소된 계산 오버헤드 및 응답 데이터
  - 철저한 분석보다 속도에 최적화

- **사용 시나리오**:
  - 원자적 사고 구성이 필요한 빠른 브레인스토밍 세션
  - 철저한 분석보다 속도가 중요한 시간에 민감한 문제 해결
  - 깊은 분해가 필요하지 않은 단순한 추론 작업
  - 전체 AoT를 사용한 심층 분석 전 초기 탐색
  - 응답 시간이 중요한 학습 또는 시연 목적

### 사용 시나리오

다음과 같은 경우에 Atom of Thoughts를 사용하면 효과적입니다:
- 복잡한 추론이 필요한 문제 해결
- 여러 관점에서 검증이 필요한 가설 생성
- 정확도가 중요한 문제에서 신뢰도 높은 결론 도출
- 논리적 오류를 최소화해야 하는 작업
- 여러 단계의 검증이 필요한 의사결정

### 원자 유형

Atom of Thoughts에서는 다섯 가지 유형의 원자를 사용합니다:

1. **premise (전제)**: 문제 해결을 위한 기본 가정이나 주어진 정보
2. **reasoning (추론)**: 다른 원자들을 기반으로 한 논리적 추론 과정
3. **hypothesis (가설)**: 가능한 해결책이나 중간 결론에 대한 제안
4. **verification (검증)**: 다른 원자(특히 가설)의 유효성을 평가하는 과정
5. **conclusion (결론)**: 검증된 가설이나 최종 문제 해결책

### 핵심 기능

#### 1. 분해-수축 메커니즘 (Decomposition-Contraction)

원자를 더 작은 하위 원자로 분해하고 검증 후 다시 수축하는 메커니즘입니다.

- **원자 분해 (Decomposition)**: 복잡한 원자를 더 작은 하위 원자로 분해합니다.
  - `startDecomposition(atomId)`: 원자 분해 시작
  - `addToDecomposition(decompositionId, atomId)`: 분해에 하위 원자 추가
  - `completeDecomposition(decompositionId)`: 분해 과정 완료

- **원자 수축 (Contraction)**: 하위 원자들이 모두 검증되면 원래 원자로 다시 수축합니다.
  - 하위 원자들의 신뢰도에 기반하여 원래 원자의 신뢰도를 계산
  - 검증된 가설이 고신뢰도를 가지면 자동으로 결론을 제안

#### 2. 자동 종료 메커니즘 (Automatic Termination)

- 최대 깊이(depth)에 도달하거나 높은 신뢰도의 결론을 찾으면 자동 종료됩니다.
- `getTerminationStatus()`: 현재 종료 상태와 이유를 반환
- `getBestConclusion()`: 가장 높은 신뢰도의 결론을 반환

### 매개변수 설명

- **atomId**: 원자의 고유 식별자 (예: 'A1', 'H2' 등)
- **content**: 원자의 실제 내용
- **atomType**: 원자의 유형 (premise, reasoning, hypothesis, verification, conclusion 중 하나)
- **dependencies**: 이 원자가 의존하는 다른 원자들의 ID 목록
- **confidence**: 이 원자의 신뢰도 (0~1 사이의 값)
- **isVerified**: 이 원자가 검증되었는지 여부
- **depth**: 이 원자의 깊이 (분해-수축 프로세스에서의 깊이 수준)

### 사용 방법

1. 문제를 이해하고 필요한 전제(premise) 원자들을 정의
2. 전제를 바탕으로 추론(reasoning) 원자 생성
3. 추론을 바탕으로 가설(hypothesis) 원자 생성
4. 가설을 검증(verification)하는 원자 생성
5. 검증된 가설을 바탕으로 결론(conclusion) 원자 도출
6. 필요시 원자 분해(decomposition)를 사용하여 더 깊이 탐색
7. 높은 신뢰도의 결론 원자를 최종 답변으로 제시

### Sequential Thinking과 Atom of Thoughts 비교 (조금 더 테스트가 필요함)

두 가지 사고 도구를 동일한 주제에 적용한 후 관찰된 차이점과 성능 특성은 다음과 같습니다:

#### 구조적 차이점

**Sequential Thinking:**
- 선형적 사고 과정: 한 사고에서 다음 사고로 순차적으로 진행
- 전체 사고 수를 미리 예측
- 각 사고 단계는 이전 단계를 기반으로 구축됨

**Atom of Thoughts:**
- 비선형, 네트워크 구조: 여러 사고 단위(원자)가 의존성을 가지고 연결됨
- 원자 유형(전제, 추론, 가설, 검증, 결론)에 따라 체계적인 구조 형성
- 각 원자의 신뢰도 수준을 명시적으로 평가

#### 비교 강점

**Sequential Thinking 강점:**
- 직관적 흐름: 자연스러운 인간의 사고 과정과 유사
- 단순성: 간단한 구조로 직관적인 문제에 빠르게 적용 가능
- 유연성: 사고 과정 중에 이전 단계를 수정하거나 방향을 변경할 수 있음

**Atom of Thoughts 강점:**
- 신뢰도 평가: 각 사고의 신뢰도를 명시적으로 측정하여 결론의 유효성 개선
- 검증 과정: 체계적인 검증 단계를 통해 가설 평가
- 의존성 추적: 어떤 전제나 추론이 특정 결론에 영향을 미쳤는지 명확하게 추적
- 병렬 처리: 여러 사고 원자를 동시에 고려 가능

#### 효율성과 정확성

**효율성:**
- Sequential Thinking: 단순한 문제에 더 효율적이며, 사고가 빠르게 진행됨
- Atom of Thoughts: 복잡한 문제에 더 효율적이지만, 체계적인 구조를 만드는 초기 오버헤드가 있음

**정확성:**
- Sequential Thinking: 사고 과정이 깊어질수록 이전 단계에서의 오류 누적 가능성
- Atom of Thoughts: 검증 단계와 신뢰도 평가를 통해 오류 가능성 감소, 더 신뢰할 수 있는 결론 도출

#### 목적별 적합성

**Sequential Thinking에 적합한 경우:**
- 단순하거나 중간 정도 복잡한 문제
- 시간 제약이 있는 상황
- 자연스러운 스토리텔링이나 설명이 필요한 경우

**Atom of Thoughts에 적합한 경우:**
- 매우 복잡한 문제
- 정확성과 신뢰성이 중요한 상황
- 여러 관점에서 검증이 필요한 가설
- 복잡한 의존 관계가 있는 추론

#### 결론
두 도구 모두 인공 지능의 추론 능력을 향상시키는 데 기여할 수 있지만, 적절한 도구는 문제의 특성과 요구 사항에 따라 달라집니다. Sequential Thinking은 직관적이고 빠른 사고 과정이 필요할 때 유용하며, Atom of Thoughts는 체계적인 검증과 높은 신뢰성이 필요한 복잡한 문제에 더 적합합니다.

### 명령어 도구 (atomcommands)

Atom of Thoughts의 분해-수축 메커니즘과 자동 종료를 제어하는 명령어 도구입니다.

**사용 가능한 명령어**:
1. **decompose**: 지정된 원자를 더 작은 하위 원자로 분해합니다.
   - 필요 매개변수: `atomId`
2. **complete_decomposition**: 진행 중인 분해 프로세스를 완료합니다.
   - 필요 매개변수: `decompositionId`
3. **termination_status**: 현재 AoT 프로세스의 종료 상태를 확인합니다.
4. **best_conclusion**: 가장 높은 신뢰도의 검증된 결론을 가져옵니다.
5. **set_max_depth**: 최대 깊이 제한을 변경합니다.
   - 필요 매개변수: `maxDepth`

### MCP 서버 설정 방법

Atom of Thoughts MCP 서버를 사용하기 위해서는 Claude Desktop 또는 Cline의 MCP 설정에 서버를 등록해야 합니다. 다음은 서버 구성의 예시입니다:

```json
{ 
  "mcpServers": { 
    "atom-of-thoughts": { 
      "command": "node", 
      "args": ["/ABSOLUTE/PATH/TO/PARENT/FOLDER/atom-of-thoughts/build/index.js"], 
      "disabled": false, 
      "autoApprove": [] 
    } 
  } 
}
```

위 설정에서 `/ABSOLUTE/PATH/TO/PARENT/FOLDER`는 실제 프로젝트가 위치한 절대 경로로 변경해주세요. 설정을 저장한 후 Claude Desktop 또는 Cline을 재시작하면 Atom of Thoughts MCP 서버를 사용할 수 있습니다.