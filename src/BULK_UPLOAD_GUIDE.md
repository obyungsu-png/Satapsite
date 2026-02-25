# 대량 업로드 양식 가이드

## 📋 개요
Study Hub의 "대량 업로드" 기능을 사용하여 한 번에 여러 문제를 업로드할 수 있습니다.

## ✨ 지원 형식
- **직접 입력**: 브라우저에서 바로 입력
- **파일 업로드**: .txt, .doc, .docx 파일 지원

## 📝 표준 양식

### 기본 구조
```
TITLE: 시험 제목
TYPE: SAT 또는 ACT
SUBJECT: Reading and Writing 또는 Math
MODULE: 1 또는 2

CATEGORY: 독해/문법/수학
SUBCATEGORY: 세부 카테고리
NUMBER: 문제 번호
DIFFICULTY: 쉬움/보통/어려움

PASSAGE:
지문 내용 (선택)

QUESTION: 질문 내용
A) 선택지 1
B) 선택지 2
C) 선택지 3
D) 선택지 4

ANSWER: A
EXPLANATION: 해설 내용 (선택)

[빈 줄로 다음 문제 구분]

CATEGORY: 독해/문법/수학
...
```

## 📂 카테고리 및 서브카테고리

### 독해 (Reading)
- **Main Idea**: 주제/주장
- **Supporting Details**: 세부사항
- **Inference**: 추론
- **Vocabulary in Context**: 문맥 속 어휘
- **Purpose/Function**: 목적/기능
- **Text Structure**: 구조
- **Point of View**: 관점
- **Comparative Reading**: 비교 독해

### 문법 (Grammar)
- **Words in Context**: 문맥 속 단어 선택
- **Sentence Structure**: 문장 구조
- **Transitions**: 전환어
- **Punctuation**: 구두점
- **Agreement**: 일치
- **Verb Tense**: 동사 시제
- **Rhetorical Synthesis**: 수사적 종합

### 수학 (Math)
- **Algebra**: 대수
- **Geometry**: 기하
- **Trigonometry**: 삼각법
- **Data Analysis**: 데이터 분석
- **Statistics**: 통계
- **Problem Solving**: 문제 해결
- **Advanced Math**: 고급 수학

## 💡 사용 예시

### 예시 1: 문법 문제
```
TITLE: SAT Practice Test 1
TYPE: SAT
SUBJECT: Reading and Writing
MODULE: 1

CATEGORY: 문법
SUBCATEGORY: Words in Context
NUMBER: 1
DIFFICULTY: 보통

PASSAGE:
The Apollo Moon landings (1969-1972) brought atmospheric sensors and soil sensors to the Moon and produced large amounts of data, much of which was stored on technologies that are now obsolete. A data-transfer project is working to ______ these data so that the information is available to researcher Noah Petrov, who is investigating the geology of the Moon.

QUESTION: Which choice completes the text with the most logical and precise word or phrase?
A) salvage
B) improve
C) amend
D) simplify

ANSWER: A
EXPLANATION: 오래된 저장 기술에 있는 데이터를 "구출(salvage)"하여 현재 사용 가능하게 만든다는 맥락이 가장 적합합니다.
```

### 예시 2: 독해 문제
```
CATEGORY: 독해
SUBCATEGORY: Main Idea
NUMBER: 2
DIFFICULTY: 어려움

PASSAGE:
Scientists have long debated whether intelligence in dolphins is comparable to that in primates. Recent studies show that dolphins can recognize themselves in mirrors, use tools, and communicate through complex vocalizations. However, some researchers argue that these behaviors may not indicate the same level of cognitive sophistication found in great apes.

QUESTION: Which choice best describes the main idea of the passage?
A) Dolphins are more intelligent than primates
B) Mirror recognition proves dolphin intelligence
C) There is ongoing debate about dolphin cognitive abilities
D) Dolphins cannot use tools effectively

ANSWER: C
EXPLANATION: 지문은 돌고래의 지능에 대한 증거와 반론을 모두 제시하며 진행 중인 논쟁을 설명합니다.
```

### 예시 3: 수학 문제
```
CATEGORY: 수학
SUBCATEGORY: Algebra
NUMBER: 3
DIFFICULTY: 쉬움

QUESTION: If 3x + 5 = 20, what is the value of x?
A) 3
B) 5
C) 7
D) 15

ANSWER: B
EXPLANATION: 3x + 5 = 20에서 양변에서 5를 빼면 3x = 15, 따라서 x = 5입니다.
```

## ⚙️ 자동 분류 시스템

업로드된 문제는 자동으로 다음과 같이 분류됩니다:

1. **Practice Tests** (스마트 연습)
   - 전체 시험이 하나의 Practice Test로 저장됨
   - 기출문제 카테고리에 배치

2. **Training** (전문 훈련)
   - CATEGORY별로 자동 분류
   - 독해 → Reading Training
   - 문법 → Grammar Training
   - 수학 → Math Training

## 🔑 필수 필드 vs 선택 필드

### 필수 필드 ✓
- `TITLE`
- `TYPE`
- `SUBJECT`
- `MODULE`
- `CATEGORY`
- `NUMBER`
- `QUESTION`
- `A), B), C), D)` (4개 선택지)
- `ANSWER`

### 선택 필드 ○
- `PASSAGE` (독해/문법 문제에 권장)
- `SUBCATEGORY` (Training 분류에 유용)
- `DIFFICULTY` (Training 난이도 필터링)
- `EXPLANATION` (학습에 도움)

## 📊 데이터 저장

- **LocalStorage**: 브라우저에 즉시 저장
- **Supabase**: 클라우드 데이터베이스에 자동 동기화
- 두 시스템 모두 실패해도 한쪽에는 저장됨

## 🎯 활용 팁

1. **템플릿 다운로드**: "템플릿 다운로드" 버튼으로 예시 파일 받기
2. **복사 붙여넣기**: 기존 문제를 복사하여 양식 유지
3. **빈 줄 주의**: 문제와 문제 사이는 반드시 빈 줄로 구분
4. **일관성 유지**: 같은 시험 내에서는 TITLE, TYPE, SUBJECT, MODULE을 동일하게 유지
5. **카테고리 혼합**: 하나의 파일에 독해, 문법, 수학을 모두 포함 가능

## ❗ 주의사항

- 파일 인코딩은 UTF-8 사용 권장
- 큰따옴표(")나 특수문자는 그대로 사용 가능
- ANSWER는 A, B, C, D 중 하나 (대소문자 무관)
- 빈 줄은 문제 구분자로만 사용
- PASSAGE가 여러 단락인 경우 그대로 줄바꿈하여 입력

## 🚀 시작하기

1. Study Hub 탭으로 이동
2. "대량 업로드" 탭 선택
3. 템플릿 다운로드 또는 직접 입력
4. "업로드" 버튼 클릭
5. Practice 또는 Training 탭에서 확인!
