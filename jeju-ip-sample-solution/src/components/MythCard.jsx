// 신화 선택 카드 — 표현 전용. 데이터는 props 로만 받는다.
// 원본 삽화의 가로·세로 비율(width/height)을 그대로 보존하는 화첩 표지 프레임을 사용한다.
export default function MythCard({ myth, selected, onSelect }) {
  const sceneCount = myth.scenes?.length ?? 0

  return (
    <button
      type="button"
      className={`myth-card tone-${myth.tone}${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(myth.id)}
    >
      <span className="myth-art" aria-hidden="true">
        {myth.chapterLabel && (
          <span className="myth-chapter-pill">{myth.chapterLabel}</span>
        )}
        <span className="myth-scene-pill">
          {sceneCount > 0 ? `원본 삽화 ${sceneCount}장면` : '현장 유적 기록'}
        </span>
        {myth.thumb ? (
          <span className="myth-art-frame">
            <img
              src={myth.thumb.src}
              alt=""
              width={myth.thumb.width}
              height={myth.thumb.height}
              loading="lazy"
            />
          </span>
        ) : (
          <span className="myth-art-symbol">
            <i className={`bi bi-${myth.icon}`} />
          </span>
        )}
      </span>
      <span className="myth-body">
        <span className="myth-meta-row">
          {myth.genreLabel && <span className="myth-genre-tag">{myth.genreLabel}</span>}
          {myth.preview ? (
            <span className="preview-badge">삽화 미수록 · 유적 기록</span>
          ) : (
            <span className="verified-badge">공공데이터 삽화 확인</span>
          )}
        </span>
        <span className="myth-title font-myth">{myth.title}</span>
        {myth.subtitle && <span className="myth-subtitle">{myth.subtitle}</span>}
        <span className="myth-place">
          <i className="bi bi-geo-alt-fill me-1" />
          <span>{myth.placeLabel || `연결 후보 장소 · ${myth.place}`}</span>
        </span>
        <span className="myth-note">
          {myth.statusNote || (myth.thumb ? '삽화·설명: 제주특별자치도 공공데이터' : '줄거리·출처는 확인 후 표시됩니다')}
        </span>
      </span>
    </button>
  )
}
