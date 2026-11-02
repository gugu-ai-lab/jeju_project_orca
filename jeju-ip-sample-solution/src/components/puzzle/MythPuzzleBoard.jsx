/**
 * MythPuzzleBoard — 신화 삽화 분할 퍼즐 보드 컴포넌트 (퍼즐 공개 전담)
 *
 * 특징:
 * - 원본 공식 삽화 파일(artwork.src)을 수정하지 않고 그리드 비율(rows × cols)로 분할 표시
 * - 정답을 맞힌 조각(unlockedPieceIds)만 실제 삽화의 해당 위치 영역을 드러냄
 * - 아직 맞히지 못한 조각은 아이보리·파스텔 하늘/민트 커버로 가려 두며, 클릭 시 해당 문제로 이동 가능
 * - 모든 조각이 열리면(isCompleted) 조각 사이 경계선이 부드럽게 사라져 하나의 완성된 그림으로 이어짐
 * - 3조각(1x3)뿐 아니라 6조각(2x3), 9조각(3x3) 등 임의의 rows × cols 격자로 확장 가능
 */
export default function MythPuzzleBoard({
  grid,
  artwork,
  pieces,
  storyTitle = '신화',
  unlockedPieceIds = [],
  activeQuestionId,
  onSelectPieceQuestion,
  onOpenLargeView,
}) {
  const rows = grid?.rows || 1
  const cols = grid?.cols || 3
  const totalPieces = grid?.totalPieces || pieces.length
  const unlockedSet = new Set(unlockedPieceIds)
  const unlockedCount = pieces.filter((p) => unlockedSet.has(p.pieceId)).length
  const isCompleted = unlockedCount >= totalPieces

  return (
    <div className="puzzle-board-card">
      <div className="puzzle-board-header">
        <div>
          <span className="puzzle-step-badge">
            🧩 그림 퍼즐 {unlockedCount} / {totalPieces} 조각 열림
          </span>
          <h4 className="puzzle-board-title mt-1 mb-0">
            {isCompleted
              ? artwork.src
                ? `✨ ${storyTitle} 신화 삽화가 하나로 완성되었어요!`
                : `✨ ${storyTitle} 퀴즈를 모두 풀었어요! 삽화는 준비 중이에요.`
              : '퀴즈를 맞힐 때마다 가려진 신화 그림이 한 조각씩 나타나요'}
          </h4>
        </div>

        {isCompleted && onOpenLargeView && (
          <button
            type="button"
            className="btn btn-primary btn-sm btn-round"
            onClick={onOpenLargeView}
          >
            <i className="bi bi-arrows-fullscreen me-1" />
            완성된 그림 크게 보기
          </button>
        )}
      </div>

      {/* 진행 상태 막대 (단색 파스텔·청록 포인트) */}
      <div className="puzzle-progress-track" aria-hidden="true">
        <div
          className="puzzle-progress-fill"
          style={{ width: `${Math.round((unlockedCount / totalPieces) * 100)}%` }}
        />
      </div>

      {/* 원본 비율을 유지하는 N×M 분할 퍼즐 프레임 */}
      <div
        className={`puzzle-grid-frame ${isCompleted ? 'is-completed' : ''}`}
        style={{
          aspectRatio: `${artwork.width} / ${artwork.height}`,
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
        role="group"
        aria-label={`${artwork.alt} 퍼즐 (${totalPieces}조각 중 ${unlockedCount}조각 공개됨)`}
      >
        {pieces.map((piece, idx) => {
          const isUnlocked = unlockedSet.has(piece.pieceId)
          const isFocusedQuestion = activeQuestionId === piece.questionId
          const toneClass = idx % 2 === 0 ? 'cover-sky' : 'cover-mint'

          return (
            <div
              key={piece.pieceId}
              className={[
                'puzzle-tile',
                isUnlocked ? 'is-unlocked' : 'is-locked',
                isFocusedQuestion && !isUnlocked ? 'is-active-target' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isUnlocked ? (
                artwork.src ? (
                  <div className="puzzle-tile-art-slice">
                    <img
                      src={artwork.src}
                      alt={`${artwork.alt} - ${piece.shortLabel}`}
                      width={artwork.width}
                      height={artwork.height}
                      draggable={false}
                      style={{
                        width: `${cols * 100}%`,
                        height: `${rows * 100}%`,
                        left: `-${piece.col * 100}%`,
                        top: `-${piece.row * 100}%`,
                      }}
                    />
                    {!isCompleted && (
                      <span className="puzzle-tile-opened-tag">
                        ✔ {idx + 1}번 조각
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="puzzle-tile-art-pending" role="status" aria-label={`${storyTitle} 삽화 준비 중`}>
                    <i className="bi bi-image" aria-hidden="true" />
                    <strong>삽화 준비 중</strong>
                    {!isCompleted && <span>{idx + 1}번 퀴즈 완료</span>}
                  </div>
                )
              ) : (
                <button
                  type="button"
                  className={`puzzle-tile-cover ${toneClass}`}
                  onClick={() => onSelectPieceQuestion?.(piece.questionId)}
                  aria-label={`${piece.shortLabel} 가려짐 — 클릭하여 ${idx + 1}번 퀴즈 풀기`}
                >
                  <span className="puzzle-cover-num">조각 {idx + 1}</span>
                  <span className="puzzle-cover-icon" aria-hidden="true">
                    <i className="bi bi-puzzle" />
                  </span>
                  <strong className="puzzle-cover-title">{piece.shortLabel}</strong>
                  <span className="puzzle-cover-sub">
                    {idx + 1}번 퀴즈를 맞히면 열려요
                  </span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="puzzle-board-footer">
        <span className="puzzle-caption-text">🖼️ {artwork.src ? artwork.caption : `${storyTitle} 삽화 준비 중`}</span>
        <span className="puzzle-session-note">
          · 현재 체험 모드 (서버 저장 연결 전에는 새로고침 시 초기화됩니다)
        </span>
      </div>
    </div>
  )
}
