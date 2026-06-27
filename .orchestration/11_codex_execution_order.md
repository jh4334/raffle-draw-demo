# Codex Execution Order — Premium Official Draw UX

## Mission
현재 `raffle-draw-demo`는 기능은 있으나 사용자가 “진짜 구리다”고 평가했다. 디자인/UX를 공식 행사장에서 신뢰감 있게 쓸 수 있는 수준으로 끌어올린다.

## Read First
- `.orchestration/08_agent_command_system.md`
- `index.html`
- `src/styles.css`
- `src/app.js`
- `src/officialDraw.js`
- `tests/officialDraw.test.js`

## Implementation Tasks

### Task 1 — IA 재구성
- 첫 화면 구조를 다음 순서로 재배치한다.
  1. 상단 공식 헤더: 기관명/행사명/현재시각
  2. 메인 히어로 결과 패널: 상태, 큰 결과 번호, 대표 CTA
  3. 하단 또는 보조 카드: 추첨 조건, 감사 로그, 보조 액션
- `공식 추첨 시작`이 가장 먼저 보이는 CTA여야 한다.

### Task 2 — Visual Design 전면 개선
- Apple/Stripe 느낌의 프리미엄 공식 콘솔 스타일 적용.
- 색상:
  - 배경: `#f6f8fb` 또는 `#f5f5f7`
  - 핵심 텍스트: `#061b31` 또는 `#111827`
  - CTA: `#0b63f6` 또는 `#533afd`
  - 성공/확정: 차분한 green
- 큰 번호 카드는 고급스럽고 선명하게.
- 회색 박스 나열 느낌 제거.

### Task 3 — Interaction 개선
- 추첨 클릭 시 즉시 결과만 툭 나오는 느낌을 줄이고 `추첨 진행 중` 상태를 거친 뒤 확정되게 한다.
- 테스트 안정성을 위해 상태 지연은 `setTimeout`을 쓰되, DOM smoke에서 우회 가능하거나 0~400ms 수준으로 제한한다.
- 사용자 메시지는 더 자연스럽게 변경한다.

### Task 4 — Mobile First
- 390px 모바일 폭 기준으로 다음을 보장한다.
  - CTA가 잘 보임
  - 결과 번호가 매우 큼
  - 입력은 접히거나 덜 튀어 보임
  - 버튼은 터치하기 쉬움

### Task 5 — Regression Protection
- 기존 테스트 유지.
- 필요하면 DOM smoke 테스트에 맞게 안정적인 DOM 구조 유지.
- `npm test` 통과.

## Output
- 변경 후 `.orchestration/12_codex_premium_redesign_report.md` 작성.
- 어떤 UX 문제를 어떻게 해결했는지 한국어로 요약.
