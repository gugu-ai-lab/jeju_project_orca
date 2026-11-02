# 제주 신화 퀴즈·그림 퍼즐 Supabase 연동 명세서 (`PUZZLE_SUPABASE_SPEC.md`)

- **작성일**: 2026-11-02
- **작성 브랜치**: `gugu-ai-lab/제미나이`
- **목적**: 프론트엔드에 구현된 **'제주 신화 퀴즈로 그림 퍼즐 완성하기'** 기능(설문대할망 3문제·3조각 시범 적용, 향후 6조각·9조각 확장 가능)을 Codex가 Supabase 및 서버 API와 연결할 때 사용할 **데이터 구조·컴포넌트 인터페이스·테이블 스키마 명세**를 정의합니다.

---

## 1. 프론트엔드 컴포넌트 분리 구조 및 이벤트 인터페이스

퍼즐 기능은 요구사항에 따라 **정답 처리**, **퍼즐 공개**, **완료 이벤트** 3개의 독립 컴포넌트와 이를 묶는 섹션 컨테이너로 분리되어 있습니다.

| 파일 경로 | 역할 | 주요 Props / 이벤트 |
| --- | --- | --- |
| `src/data/mythQuizPuzzles.js` | 신화별 퍼즐 격자(`grid`), 조각(`pieces`), 검증된 3지선다 문제(`questions`), 순수 판정 함수(`evaluateQuizSubmission`) | `getMythQuizPuzzle(storyId)`, `evaluateQuizSubmission(config, progress, questionId, selectedOptionId)` |
| `src/components/puzzle/QuizQuestionCard.jsx` | **정답 처리 전담**: 3지선다 보기 렌더링, 정답/오답 힌트 표시, 해결 완료 문제 중복 제출 방지 | `questions`, `activeQuestionId`, `solvedQuestionIds`, `onSelectQuestion`, `onSubmitAnswer` |
| `src/components/puzzle/MythPuzzleBoard.jsx` | **퍼즐 공개 전담**: 원본 공식 삽화(`artwork.src`)를 `rows × cols` 격자로 분할하고 `unlockedPieceIds`에 포함된 조각만 표시 | `grid`, `artwork`, `pieces`, `unlockedPieceIds`, `activeQuestionId`, `onSelectPieceQuestion`, `onOpenLargeView` |
| `src/components/puzzle/PuzzleCompletionBanner.jsx` | **완료 이벤트 전담**: 모든 조각이 열렸을 때 축하 애니메이션 배너와 원본 비율 크게 감상하기 모달 표시 (스탬프·배지·캐릭터 보상 없음) | `artwork`, `storyTitle`, `isLargeViewOpen`, `onOpenLargeView`, `onCloseLargeView`, `onResetPuzzle` |
| `src/components/puzzle/MythQuizPuzzleSection.jsx` | **통합 컨테이너 & Supabase 연동 진입점** | `storyId`, `storyTitle`, `initialProgress`, `onAnswerRecorded`, `onPieceUnlocked`, `onPuzzleCompleted` |

---

## 2. `MythQuizPuzzleSection` 연동 Props 계약 (Codex 연결 지점)

Codex가 추후 Supabase 조회/저장 훅 또는 Zustand 스토어를 연결할 때, `MythQuizPuzzleSection`에 아래 4개의 prop만 전달하면 UI 수정 없이 즉시 영구 저장이 작동합니다.

### 2.1 초기 조회 데이터 주입 (`initialProgress`)
```ts
interface PuzzleProgressState {
  solvedQuestionIds: string[] // 예: ['q-seolmundae-1', 'q-seolmundae-2']
  unlockedPieceIds: string[]  // 예: ['seolmundae-piece-1', 'seolmundae-piece-2']
  isCompleted: boolean        // unlockedPieceIds.length === grid.totalPieces
}
```

### 2.2 이벤트 콜백 페이로드 (`onAnswerRecorded`, `onPieceUnlocked`, `onPuzzleCompleted`)

1. **`onAnswerRecorded(payload)`** — 학생이 보기를 클릭할 때마다 호출
   ```json
   {
     "storyId": "seolmundae",
     "puzzleId": "puzzle-seolmundae-3piece-v1",
     "questionId": "q-seolmundae-1",
     "selectedOptionId": "opt-skirt",
     "isCorrect": true,
     "alreadySolved": false,
     "timestamp": "2026-11-02T13:55:00.000Z"
   }
   ```

2. **`onPieceUnlocked(payload)`** — 정답을 맞혀 **새로운 퍼즐 조각이 최초로 열렸을 때만** 호출 (이미 맞힌 문제를 다시 클릭해도 중복 호출되지 않음)
   ```json
   {
     "storyId": "seolmundae",
     "puzzleId": "puzzle-seolmundae-3piece-v1",
     "questionId": "q-seolmundae-1",
     "pieceId": "seolmundae-piece-1",
     "unlockedPieceIds": ["seolmundae-piece-1"],
     "timestamp": "2026-11-02T13:55:00.000Z"
   }
   ```

3. **`onPuzzleCompleted(payload)`** — 마지막 남은 조각까지 모두 열려 **퍼즐 전체가 완성된 순간 1회** 호출
   ```json
   {
     "storyId": "seolmundae",
     "puzzleId": "puzzle-seolmundae-3piece-v1",
     "solvedQuestionIds": ["q-seolmundae-1", "q-seolmundae-2", "q-seolmundae-3"],
     "unlockedPieceIds": ["seolmundae-piece-1", "seolmundae-piece-2", "seolmundae-piece-3"],
     "totalPieces": 3,
     "completedAt": "2026-11-02T13:56:00.000Z"
   }
   ```

---

## 3. 문제-조각 고정 매핑 및 멱등성(Idempotency) 보장 규칙

1. **고유 ID 기반 1:1 고정 매핑**:
   - 각 문제는 배열 인덱스가 아니라 고유 ID(`question.id`)와 조각 ID(`question.pieceId`, `piece.row`, `piece.col`)로 직접 연결됩니다.
   - 설문대할망 매핑 표:
     - `q-seolmundae-1` ↔ `seolmundae-piece-1` (`row: 0, col: 0`, 왼쪽 조각)
     - `q-seolmundae-2` ↔ `seolmundae-piece-2` (`row: 0, col: 1`, 가운데 조각)
     - `q-seolmundae-3` ↔ `seolmundae-piece-3` (`row: 0, col: 2`, 오른쪽 조각)
2. **문제 순서 무관 & 새로고침 복원 안정성**:
   - 학생이 `2번 퀴즈 → 1번 퀴즈 → 3번 퀴즈` 순서로 풀거나, DB에서 `unlockedPieceIds` 배열 순서가 다르게 조회되더라도 항상 해당 `pieceId`의 위치(`row`, `col`) 조각이 정확히 열립니다.
3. **중복 지급 방지 및 조각 재잠금 방지**:
   - `evaluateQuizSubmission()`은 `solvedQuestionIds`와 `unlockedPieceIds`에 대해 합집합(Set Union) 연산만 수행합니다.
   - 이미 맞힌 문제를 다시 클릭해도 조각 수가 늘어나지 않으며(`newlyUnlockedPieceId: null`), 다른 문제에서 오답을 골라도 이전에 열린 조각은 절대 다시 닫히지 않습니다.

---

## 4. 권장 Supabase 신규 테이블 스키마 (Codex 참고용)

> **주의 (`AGENTS.md` 절대 지침 준수)**: 기존 Supabase 테이블을 삭제·덮어쓰기·초기화하지 말고, 아래와 같이 **신규 이름의 테이블(`jeju_myth_puzzle_progress`)**을 생성하여 사용합니다.

```sql
-- 신규 테이블: 학생(또는 브라우저 익명 세션 client_id)별 신화 퍼즐 진행 상태 저장
create table if not exists public.jeju_myth_puzzle_progress (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,                      -- 브라우저 고유 식별자 또는 로그인 사용자 ID
  story_id text not null,                       -- 예: 'seolmundae'
  puzzle_id text not null,                      -- 예: 'puzzle-seolmundae-3piece-v1'
  solved_question_ids text[] not null default '{}',
  unlocked_piece_ids text[] not null default '{}',
  total_pieces integer not null default 3,      -- 향후 6조각, 9조각 확장 대응
  is_completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (client_id, puzzle_id)
);
```

---

## 5. 향후 6조각(2×3) · 9조각(3×3) 확장 방법

`MythPuzzleBoard.jsx`는 `grid: { rows, cols, totalPieces }`와 각 조각의 `{ row, col }` 좌표를 사용해 원본 이미지 슬라이스 위치(`width: cols * 100%`, `height: rows * 100%`, `left: -col * 100%`, `top: -row * 100%`)를 자동 계산합니다.
- **6조각 확장 시**: `grid: { rows: 2, cols: 3, totalPieces: 6 }` 및 `row: 0..1, col: 0..2` 조각 6개 정의
- **9조각 확장 시**: `grid: { rows: 3, cols: 3, totalPieces: 9 }` 및 `row: 0..2, col: 0..2` 조각 9개 정의
