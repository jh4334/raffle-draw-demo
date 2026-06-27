# 구현 태스크 (for Codex)

> 아래 순서대로 구현한다. 각 태스크 완료 후 `npm test`로 확인한다.

## Task 1: `src/raffle.js` — `parseNames` 구현
- 입력: 여러 줄 문자열 (`raw`)
- `\n`으로 분리 → 각 항목 `trim()` → 빈 문자열 제거 → 중복 제거 (순서 유지)
- 반환: `string[]`
- `export { parseNames }`

## Task 2: `src/raffle.js` — `validateCount` 구현
- 입력: `names` 배열, `count` 숫자
- `count < 1`이면 `throw new RangeError('당첨자 수는 1 이상이어야 합니다')`
- `count > names.length`이면 `throw new RangeError('당첨자 수가 참가자 수를 초과합니다')`
- `export { validateCount }`

## Task 3: `src/raffle.js` — `draw` 구현
- 입력: `names` 배열, `count` 숫자
- 내부에서 `validateCount(names, count)` 호출
- Fisher-Yates 셔플로 `names` 복사본을 섞은 뒤 앞에서 `count`개 slice하여 반환
- 반환: `string[]`
- `export { draw }`

## Task 4: `tests/raffle.test.js` — 단위 테스트 작성
- `node:test`의 `describe`/`it` + `node:assert/strict` 사용
- `import { parseNames, validateCount, draw } from '../src/raffle.js'`
- 테스트 케이스:
  - `parseNames`: 기본 분리, 빈 줄 무시, 공백 trim, 중복 제거, 빈 입력 → `[]`
  - `validateCount`: count=0 에러, count 음수 에러, count 초과 에러, 정상 통과
  - `draw`: 반환 길이 === count, 중복 없음, 원본에 포함, 전원 추첨 시 전원 반환
- `npm test` 실행하여 전체 통과 확인

## Task 5: `src/app.js` — DOM 바인딩
- `import { parseNames, draw } from './raffle.js'`
- 요소 캐싱: `#names`, `#winner-count`, `#draw-button`, `#reset-button`, `#result-list`, `#message`
- `#draw-button` 클릭 핸들러:
  1. `parseNames(textarea.value)`로 이름 파싱
  2. `draw(names, Number(input.value))` 호출
  3. 성공: `#result-list`에 `<li>` 렌더링, `#message` 비우기
  4. 에러(`RangeError`): `#message.textContent`에 에러 메시지 표시
- `#reset-button` 클릭 핸들러:
  1. textarea 비우기
  2. input을 `1`로 초기화
  3. `#result-list` 비우기
  4. `#message` 비우기

## Task 6: 최종 검증
- `npm test` 전체 통과 확인
- `npm start`로 로컬 서버 기동 후 브라우저에서 수동 확인
  - 이름 3개 입력 → 1명 뽑기 → 결과 표시
  - 당첨자 수 초과 입력 → 에러 메시지 표시
  - 초기화 → 모든 필드 클리어
