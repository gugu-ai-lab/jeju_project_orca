import { useState } from 'react'
import { evaluateQuizSubmission, getMythQuizPuzzle } from '../../data/mythQuizPuzzles'
import MythPuzzleBoard from './MythPuzzleBoard'
import QuizQuestionCard from './QuizQuestionCard'
import PuzzleCompletionBanner from './PuzzleCompletionBanner'

/**
 * MythQuizPuzzleSection — 신화 퀴즈 & 그림 퍼즐 통합 섹션 컨테이너
 *
 * 역할 분리:
 * 1. QuizQuestionCard: 3지선다 문제 표시 및 정답/힌트 처리
 * 2. MythPuzzleBoard: 분할된 삽화 조각 공개 및 완성 그림 병합 표시
 * 3. PuzzleCompletionBanner: 완성 축하 애니메이션 및 크게 감상하기 모달
 *
 * 향후 Codex의 Supabase 연동을 위한 외부 콜백 인터페이스:
 * - initialProgress: { solvedQuestionIds: string[], unlockedPieceIds: string[], isCompleted: boolean }
 * - onAnswerRecorded(payload): 정답/오답 제출 시 호출
 * - onPieceUnlocked(payload): 새 퍼즐 조각이 열릴 때 호출 (중복 지급 방지됨)
 * - onPuzzleCompleted(payload): 모든 조각이 열려 퍼즐이 완성된 순간 1회 호출
 */
export default function MythQuizPuzzleSection({
  storyId,
  storyTitle = '설문대할망',
  initialProgress,
  onAnswerRecorded,
  onPieceUnlocked,
  onPuzzleCompleted,
}) {
  const puzzleConfig = getMythQuizPuzzle(storyId)

  const [progress, setProgress] = useState(() => ({
    solvedQuestionIds: Array.isArray(initialProgress?.solvedQuestionIds)
      ? initialProgress.solvedQuestionIds
      : [],
    unlockedPieceIds: Array.isArray(initialProgress?.unlockedPieceIds)
      ? initialProgress.unlockedPieceIds
      : [],
    isCompleted: Boolean(initialProgress?.isCompleted),
  }))

  const [activeQuestionId, setActiveQuestionId] = useState(
    () => puzzleConfig?.questions?.[0]?.id || null
  )
  const [isLargeViewOpen, setIsLargeViewOpen] = useState(false)

  if (!puzzleConfig) return null

  function handleAnswerSubmit({ questionId, selectedOptionId }) {
    const evalResult = evaluateQuizSubmission(
      puzzleConfig,
      progress,
      questionId,
      selectedOptionId
    )

    if (!evalResult.isValid) return evalResult

    // 상태 업데이트 (이미 맞힌 조각은 절대 닫히지 않으며, 중복 지급되지 않음)
    setProgress(evalResult.nextProgress)

    const timestamp = new Date().toISOString()

    // 1. 정답/오답 이벤트 콜백 (추후 Supabase 저장 연결용)
    onAnswerRecorded?.({
      storyId: puzzleConfig.storyId,
      puzzleId: puzzleConfig.puzzleId,
      questionId,
      selectedOptionId,
      isCorrect: evalResult.isCorrect,
      alreadySolved: evalResult.alreadySolved,
      timestamp,
    })

    // 2. 새로운 퍼즐 조각이 열린 경우에만 조각 공개 이벤트 발생
    if (evalResult.newlyUnlockedPieceId) {
      onPieceUnlocked?.({
        storyId: puzzleConfig.storyId,
        puzzleId: puzzleConfig.puzzleId,
        questionId,
        pieceId: evalResult.newlyUnlockedPieceId,
        unlockedPieceIds: evalResult.nextProgress.unlockedPieceIds,
        timestamp,
      })
    }

    // 3. 모든 조각이 처음으로 완성된 순간 완료 이벤트 발생
    if (evalResult.justCompleted) {
      onPuzzleCompleted?.({
        storyId: puzzleConfig.storyId,
        puzzleId: puzzleConfig.puzzleId,
        solvedQuestionIds: evalResult.nextProgress.solvedQuestionIds,
        unlockedPieceIds: evalResult.nextProgress.unlockedPieceIds,
        totalPieces: puzzleConfig.grid.totalPieces,
        completedAt: timestamp,
      })
    }

    return evalResult
  }

  function handleResetPuzzle() {
    setProgress({
      solvedQuestionIds: [],
      unlockedPieceIds: [],
      isCompleted: false,
    })
    setActiveQuestionId(puzzleConfig.questions[0]?.id || null)
    setIsLargeViewOpen(false)
  }

  return (
    <section
      id="myth-quiz-puzzle"
      className="myth-quiz-puzzle-section surface mt-4"
      aria-labelledby="puzzle-section-title"
    >
      <div className="puzzle-section-head">
        <div>
          <span className="hero-cute-badge">🧩 이야기 마침표 · 신화 그림 퍼즐</span>
          <h3 id="puzzle-section-title" className="puzzle-section-title mt-2 mb-1">
            {puzzleConfig.title}
          </h3>
          <p className="puzzle-section-sub mb-0">{puzzleConfig.subtitle}</p>
        </div>
      </div>

      {/* 모든 문제를 맞혀 퍼즐이 완성되면 축하 배너 + 크게 감상하기 모달 활성화 */}
      {progress.isCompleted && (
        <PuzzleCompletionBanner
          artwork={puzzleConfig.artwork}
          storyTitle={storyTitle}
          isLargeViewOpen={isLargeViewOpen}
          onOpenLargeView={() => setIsLargeViewOpen(true)}
          onCloseLargeView={() => setIsLargeViewOpen(false)}
          onResetPuzzle={handleResetPuzzle}
        />
      )}

      <div className="puzzle-workspace-grid mt-3">
        {/* 왼쪽(또는 상단): 3조각 분할 신화 삽화 퍼즐 보드 */}
        <MythPuzzleBoard
          grid={puzzleConfig.grid}
          artwork={puzzleConfig.artwork}
          pieces={puzzleConfig.pieces}
          storyTitle={storyTitle}
          unlockedPieceIds={progress.unlockedPieceIds}
          activeQuestionId={activeQuestionId}
          onSelectPieceQuestion={(qId) => setActiveQuestionId(qId)}
          onOpenLargeView={() => setIsLargeViewOpen(true)}
        />

        {/* 오른쪽(또는 하단): 3지선다 신화 퀴즈 카드 */}
        <QuizQuestionCard
          questions={puzzleConfig.questions}
          storyTitle={storyTitle}
          activeQuestionId={activeQuestionId}
          solvedQuestionIds={progress.solvedQuestionIds}
          onSelectQuestion={(qId) => setActiveQuestionId(qId)}
          onSubmitAnswer={handleAnswerSubmit}
        />
      </div>
    </section>
  )
}
