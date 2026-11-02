/**
 * PuzzleCompletionBanner — 퍼즐 완성 축하 애니메이션 및 전체 삽화 크게 감상하기 컴포넌트 (완료 이벤트 전담)
 *
 * 특징:
 * - 모든 퍼즐 조각이 열렸을 때만 표시됨
 * - 스탬프, 배지, 메달, 캐릭터 그림 등 별도 보상을 지급하지 않고, 오직 완성된 신화 삽화 감상에 집중
 * - 짧고 귀여운 파스텔 반짝임 축하 효과와 함께 원본 비율 전체 그림을 크게 볼 수 있는 모달 뷰어 제공
 */
export default function PuzzleCompletionBanner({
  artwork,
  storyTitle,
  isLargeViewOpen,
  onOpenLargeView,
  onCloseLargeView,
  onResetPuzzle,
}) {
  if (!artwork) return null
  const hasArtwork = Boolean(artwork.src)

  return (
    <>
      <div className="puzzle-complete-banner" role="status" aria-live="polite">
        <div className="puzzle-complete-sparkles" aria-hidden="true">
          <span className="sparkle-dot s1">✦</span>
          <span className="sparkle-dot s2">✧</span>
          <span className="sparkle-dot s3">✦</span>
        </div>

        <div className="puzzle-complete-content">
          <div>
            <span className="puzzle-complete-pill">🎉 세 조각 모두 완성!</span>
            <h4 className="puzzle-complete-heading mt-1 mb-1">
              {storyTitle} 신화 그림 퍼즐을 모두 맞췄어요!
            </h4>
            <p className="puzzle-complete-desc mb-0">
              {hasArtwork
                ? '가려져 있던 세 조각이 하나로 이어졌어요. 완성된 제주 신화 삽화를 크게 펼쳐 감상해 보세요.'
                : '세 문제를 모두 맞혔어요! 대표 삽화가 준비되면 이 퍼즐 조각에 그림이 나타나요.'}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {hasArtwork && <button
              type="button"
              className="btn btn-primary btn-round"
              onClick={onOpenLargeView}
            >
              <i className="bi bi-arrows-fullscreen me-1" />
              완성된 그림 크게 감상하기
            </button>}
            {onResetPuzzle && (
              <button
                type="button"
                className="btn btn-outline-sea btn-round"
                onClick={onResetPuzzle}
              >
                <i className="bi bi-arrow-counterclockwise me-1" />
                퍼즐 다시 맞춰보기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 완성된 공식 삽화 크게 보기 모달 */}
      {isLargeViewOpen && (
        <div
          className="puzzle-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${storyTitle} 완성된 신화 삽화 크게 보기`}
          onClick={onCloseLargeView}
        >
          <div
            className="puzzle-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="puzzle-lightbox-header">
              <div>
                <span className="puzzle-step-badge">🖼️ 완성된 신화 삽화</span>
                <h4 className="puzzle-lightbox-title mt-1 mb-0">
                  {artwork.caption}
                </h4>
              </div>
              <button
                type="button"
                className="btn btn-outline-sea btn-sm btn-round"
                onClick={onCloseLargeView}
              >
                닫기 ✕
              </button>
            </div>

            <div className="puzzle-lightbox-image-wrap">
              <img
                src={artwork.src}
                alt={artwork.alt}
                width={artwork.width}
                height={artwork.height}
              />
            </div>

            <div className="puzzle-lightbox-footer">
              <p className="mb-1">{artwork.description}</p>
              <p className="puzzle-lightbox-source mb-0">
                {artwork.source && `출처: ${artwork.source.label} (${artwork.source.license})`}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
