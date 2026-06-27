# 구현 계획

## 개요
교실/모임에서 사용할 수 있는 간단한 웹 뽑기 프로그램.
외부 의존성 없이 바닐라 JS + Node `node:test`로 구성한다.

## 아키텍처

```
index.html          ← 완성됨 (변경 불필요)
src/styles.css      ← 완성됨 (변경 불필요)
src/raffle.js       ← 순수 로직 모듈 (DOM 무관)
src/app.js          ← DOM 바인딩 · 이벤트 핸들러
tests/raffle.test.js ← raffle.js 단위 테스트
```

## 모듈 설계

### `src/raffle.js` — 순수 함수 모듈

| 함수 | 시그니처 | 역할 |
|------|---------|------|
| `parseNames` | `(raw: string) => string[]` | 줄 단위 분리 → trim → 빈 줄 제거 → 중복 제거 후 배열 반환 |
| `validateCount` | `(names: string[], count: number) => void` | count < 1 또는 count > names.length이면 `RangeError` throw |
| `draw` | `(names: string[], count: number) => string[]` | 비중복 무작위 추첨, count명 반환. 내부에서 `validateCount` 호출 |

- 모든 함수는 `export`하여 테스트·app.js 양쪽에서 사용한다.
- `draw`는 Fisher-Yates 셔플 후 앞에서 count개를 잘라 반환한다.

### `src/app.js` — UI 연결

1. `DOMContentLoaded` 시 요소 캐싱 (`#names`, `#winner-count`, `#draw-button`, `#reset-button`, `#result-list`, `#message`)
2. **뽑기 버튼 클릭**:
   - `parseNames`로 이름 파싱
   - `draw` 호출 (에러 시 `#message`에 안내 표시)
   - 결과를 `<li>`로 `#result-list`에 렌더링
3. **초기화 버튼 클릭**: textarea · input · 결과 영역 초기화

### `tests/raffle.test.js` — 단위 테스트

- `parseNames`: 빈 줄 제거, 앞뒤 공백 제거, 중복 제거
- `validateCount`: 정상 범위 통과, 0/음수/초과 시 에러
- `draw`: 반환 길이 일치, 중복 없음, 원본에 포함됨, 전원 추첨 시 전원 반환

## 제약 사항
- 외부 패키지 설치 금지 (`npm install` 없음)
- `Math.random` 사용 (암호학적 보안 불필요)
- 모바일 대응은 기존 CSS의 `min()` 함수로 충분
