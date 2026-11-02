import { useState } from 'react'

/**
 * QuizQuestionCard — 3지선다 신화 퀴즈 출제 및 정답/힌트 처리 컴포넌트 (정답 처리 전담)
 *
 * 특징:
 * - 문제 탭(1번, 2번, 3번)을 자유롭게 오가며 풀 수 있음
 * - 이미 맞힌 문제는 '해결 완료' 상태로 표시하고 조각을 중복 지급하지 않음
 * - 다른 문제를 틀리거나 순서를 바꿔도 기존에 맞힌 문제의 정답/조각 상태는 유지됨
 * - 오답 선택 시 부드러운 힌트를 보여주고 즉시 다시 도전할 수 있음
 */
export default function QuizQuestionCard({
  questions = [],
  activeQuestionId,
  solvedQuestionIds = [],
  onSelectQuestion,
  onSubmitAnswer,
}) {
  // 문제별 마지막 선택 보기 및 피드백 상태 (문제 전환 시에도 자연스럽게 유지)
  const [attemptsByQuestion, setAttemptsByQuestion] = useState({})

  const solvedSet = new Set(solvedQuestionIds)
  const activeIndex = Math.max(
    0,
    questions.findIndex((q) => q.id === activeQuestionId)
  )
  const question = questions[activeIndex] || questions[0]

  if (!question) return null

  const isQuestionSolved = solvedSet.has(question.id)
  const attempt = attemptsByQuestion[question.id] || null

  function handleOptionClick(optionId) {
    // 이미 맞힌 문제를 다시 누른 경우: 중복 지급 없이 정답 해설만 유지
    if (isQuestionSolved) {
      onSubmitAnswer?.({
        questionId: question.id,
        selectedOptionId: question.correctOptionId,
      })
      return
    }

    const result = onSubmitAnswer?.({
      questionId: question.id,
      selectedOptionId: optionId,
    })

    setAttemptsByQuestion((prev) => ({
      ...prev,
      [question.id]: {
        selectedOptionId: optionId,
        isCorrect: Boolean(result?.isCorrect),
      },
    }))
  }

  function handleNextUnsolved() {
    const nextUnsolved = questions.find(
      (q) => q.id !== question.id && !solvedSet.has(q.id)
    )
    if (nextUnsolved) {
      onSelectQuestion?.(nextUnsolved.id)
    }
  }

  const hasMoreUnsolved = questions.some(
    (q) => q.id !== question.id && !solvedSet.has(q.id)
  )

  return (
    <div className="quiz-card-box">
      {/* 상단 문제 번호 탭 (순서를 바꿔 풀어도 각 문제-조각 연결이 유지됨) */}
      <div className="quiz-tabs" role="tablist" aria-label="설문대할망 퀴즈 문제 선택">
        {questions.map((q, idx) => {
          const solved = solvedSet.has(q.id)
          const active = q.id === question.id
          return (
            <button
              key={q.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={[
                'quiz-tab-btn',
                active ? 'is-active' : '',
                solved ? 'is-solved' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectQuestion?.(q.id)}
            >
              <span className="quiz-tab-num">{idx + 1}번 퀴즈</span>
              <span className="quiz-tab-status">
                {solved ? '✔ 조각 열림' : `조각 ${idx + 1}`}
              </span>
            </button>
          )
        })}
      </div>

      {/* 현재 문제 본문 */}
      <div className="quiz-body" key={question.id}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <span className="quiz-piece-link-pill">
            🎯 정답을 맞히면 <strong>{activeIndex + 1}번 퍼즐 조각</strong>이 열려요
          </span>
          {isQuestionSolved && (
            <span className="quiz-solved-pill">
              ✔ 이미 맞힌 문제예요 (조각 공개 완료)
            </span>
          )}
        </div>

        <h4 className="quiz-prompt-title">
          Q{activeIndex + 1}. {question.prompt}
        </h4>

        {/* 3지선다 보기 목록 */}
        <div className="quiz-options-list" role="group" aria-label={`Q${activeIndex + 1} 보기`}>
          {question.options.map((opt, optIdx) => {
            const isCorrectOption = opt.id === question.correctOptionId
            const isSelected = attempt?.selectedOptionId === opt.id

            let stateClass = ''
            if (isQuestionSolved && isCorrectOption) {
              stateClass = 'is-correct'
            } else if (isSelected && !attempt?.isCorrect) {
              stateClass = 'is-wrong'
            }

            return (
              <button
                key={opt.id}
                type="button"
                className={`quiz-option-btn ${stateClass}`}
                onClick={() => handleOptionClick(opt.id)}
                disabled={isQuestionSolved}
              >
                <span className="quiz-option-index">{optIdx + 1}</span>
                <span className="quiz-option-text">{opt.text}</span>
                {isQuestionSolved && isCorrectOption && (
                  <span className="quiz-option-mark">정답 ✔</span>
                )}
                {!isQuestionSolved && isSelected && !attempt?.isCorrect && (
                  <span className="quiz-option-mark is-retry">다시 선택해 보세요</span>
                )}
              </button>
            )
          })}
        </div>

        {/* 오답 시 부드러운 힌트 표시 (다시 도전 유도) */}
        {!isQuestionSolved && attempt && !attempt.isCorrect && (
          <div className="quiz-feedback-box is-hint" role="status">
            <div className="quiz-feedback-title">
              💡 아깝네요! 힌트를 보고 다시 골라 볼까요?
            </div>
            <p className="quiz-feedback-desc mb-0">{question.hint}</p>
          </div>
        )}

        {/* 정답 시 해설 및 다음 문제 이동 버튼 */}
        {isQuestionSolved && (
          <div className="quiz-feedback-box is-correct" role="status">
            <div className="quiz-feedback-title">
              🎉 {activeIndex + 1}번 퍼즐 조각이 열렸어요!
            </div>
            <p className="quiz-feedback-desc mb-1">{question.explanation}</p>
            <p className="quiz-feedback-evidence mb-0">
              📚 근거 자료: {question.evidence}
            </p>
            {hasMoreUnsolved && (
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm btn-round"
                  onClick={handleNextUnsolved}
                >
                  다음 퀴즈 풀고 조각 열기 →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
