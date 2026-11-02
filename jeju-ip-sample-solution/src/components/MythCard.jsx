// 신화 선택 카드 — 표현 전용. 데이터는 props 로만 받는다.
export default function MythCard({ myth, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`myth-card tone-${myth.tone}${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(myth.id)}
    >
      <span className="myth-art" aria-hidden="true">
        <i className={`bi bi-${myth.icon}`} />
      </span>
      <span className="myth-body">
        {myth.preview && <span className="preview-badge">예시 데이터 · 미리보기</span>}
        <span className="myth-title font-myth">{myth.title}</span>
        <span className="myth-place"><i className="bi bi-geo-alt me-1" />연결 후보 장소 · {myth.place}</span>
        <span className="myth-note">줄거리·출처는 API 연결 후 표시됩니다</span>
      </span>
    </button>
  )
}
