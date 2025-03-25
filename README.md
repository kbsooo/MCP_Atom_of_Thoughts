# Atom of Thoughts (AoT)

A Model Context Protocol (MCP) server implementation of Atom of Thoughts, a decomposition-based reasoning framework.

> **Note**: This implementation is based on the research paper ["Atom of Thoughts for Markov LLM Test-Time Scaling"](https://arxiv.org/abs/2502.12018) (Teng et al., 2025).

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

For detailed implementation and code-level documentation, please refer to the source code in this repository.