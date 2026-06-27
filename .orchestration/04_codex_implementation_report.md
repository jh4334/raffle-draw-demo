# Codex 구현 보고서

## 구현 범위
- `src/raffle.js`
  - `parseNames(raw)` 구현: 줄 단위 분리, `trim`, 빈 줄 제거, 첫 등장 순서 기준 중복 제거.
  - `validateCount(names, count)` 구현: 1 미만 및 참가자 수 초과 시 `RangeError` 발생.
  - `draw(names, count)` 구현: 원본 배열을 보존하고 Fisher-Yates 셔플 복사본에서 요청 수만큼 반환.
  - 기존 테스트 호환을 위해 `validateWinnerCount(count, names)`, `drawWinners(names, count, random)`도 함께 export.
- `src/app.js`
  - `#names`, `#winner-count`, `#draw-button`, `#reset-button`, `#result-list`, `#message` DOM 요소 바인딩.
  - 뽑기 클릭 시 이름 파싱, 당첨자 추첨, `<li>` 결과 렌더링, 성공 메시지 초기화.
  - `RangeError` 발생 시 결과를 비우고 `#message`에 오류 문구 표시.
  - 초기화 클릭 시 입력값, 당첨자 수, 결과, 메시지를 초기 상태로 복원.

## 구현 메모
- 테스트 파일은 수정하지 않았다.
- 외부 의존성은 추가하지 않았다.
- 현재 `tests/raffle.test.js`는 `drawWinners`, `validateWinnerCount`를 import하므로, 문서의 신규 API와 기존 테스트 API를 모두 유지했다.
- 브라우저 UI 검증은 시도했지만 이 실행 환경의 sandbox가 로컬 서버 바인딩과 브라우저 실행을 차단했다. 대신 외부 의존성 없는 DOM harness로 이벤트 바인딩과 상태 변화를 검증했다. 자세한 내용은 `05_test_report.md`에 기록했다.
