# 테스트 보고서

## 실행 결과

### 1. 초기 실패 확인
- 명령: `npm test`
- 결과: 실패
- 원인: `src/raffle.js`가 `drawWinners` export를 제공하지 않아 `tests/raffle.test.js` import 단계에서 실패.

### 2. 최종 단위 테스트
- 명령: `npm test`
- 결과: 통과
- 요약:
  - 총 5개 테스트 통과
  - 실패 0개
  - 확인 항목: 이름 파싱, 당첨자 수 검증, 중복 없는 추첨, 전체 참가자 추첨

### 3. 문법 확인
- 명령: `node --check src/raffle.js`
- 결과: 통과
- 명령: `node --check src/app.js`
- 결과: 통과

### 4. UI 동작 검증
- 대상 플로우:
  - 이름 3개 입력 -> 당첨자 수 1 -> 뽑기 -> 결과 1명 표시
  - 당첨자 수 5 -> 뽑기 -> `당첨자 수가 참가자 수를 초과합니다` 메시지 표시
  - 초기화 -> 입력, 결과, 메시지 초기화
- 실행 방식: 외부 의존성 없는 Node DOM harness
- 결과: 통과
- 관찰 상태:
  - `drawState.resultCount`: `1`
  - `errorState.message`: `당첨자 수가 참가자 수를 초과합니다`
  - `resetState`: `{ names: "", count: "1", resultCount: 0, message: "" }`

## 브라우저/서버 검증 제한
- 명령: `npm start`
- 결과: 실패
- 원인: Python HTTP server가 socket bind 단계에서 `PermissionError: [Errno 1] Operation not permitted`로 차단됨.
- 추가 시도: `python3 -m http.server 8080 --bind 127.0.0.1`
- 결과: 동일한 권한 오류로 실패.

- in-app Browser 검증:
  - 결과: 실패
  - 원인: Browser runtime setup이 `sandboxCwd must be an absolute file URI` 오류로 시작 전 실패.

- Playwright fallback 검증:
  - 결과: 실패
  - 원인:
    - Chromium: macOS sandbox에서 `MachPortRendezvousServer` 권한 오류로 종료.
    - Firefox/WebKit: 해당 Playwright browser executable 미설치.
    - `npm exec playwright`는 네트워크 차단으로 registry 접근 실패.

## 최종 판단
- `npm test`는 통과했다.
- 변경된 JavaScript 파일의 문법 검사는 통과했다.
- DOM 이벤트 흐름은 harness에서 통과했다.
- 실제 렌더링 브라우저 QA는 현재 sandbox 권한 제한 때문에 완료하지 못했다.
