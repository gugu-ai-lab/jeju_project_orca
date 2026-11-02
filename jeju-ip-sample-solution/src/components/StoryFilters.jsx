import { CATEGORY_LABEL } from '../lib/storyFilter'

// 검색·분류 컨트롤 — 표현 전용. value = { query, category, onlyVerified, onlyWithImage }
export default function StoryFilters({ value, onChange, categories, total, shown }) {
  const set = (patch) => onChange({ ...value, ...patch })
  return (
    <div className="story-filters surface p-3">
      <div className="input-group">
        <span className="input-group-text"><i className="bi bi-search" /></span>
        <input className="form-control" type="search" value={value.query} placeholder="이야기·장소 검색"
          aria-label="이야기 검색" onChange={(e) => set({ query: e.target.value })} />
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3 align-items-center">
        {categories.length > 1 && ['all', ...categories].map((c) => (
          <button key={c} type="button" className={`btn btn-sm ${value.category === c ? 'btn-primary' : 'btn-outline-sea'}`}
            aria-pressed={value.category === c} onClick={() => set({ category: c })}>
            {c === 'all' ? '전체' : CATEGORY_LABEL[c]}
          </button>
        ))}
        <div className="form-check form-switch ms-md-auto mb-0">
          <input className="form-check-input" type="checkbox" id="f-verified" checked={value.onlyVerified} onChange={(e) => set({ onlyVerified: e.target.checked })} />
          <label className="form-check-label small" htmlFor="f-verified">출처 확인된 이야기만 보기</label>
        </div>
        <div className="form-check form-switch mb-0">
          <input className="form-check-input" type="checkbox" id="f-image" checked={value.onlyWithImage} onChange={(e) => set({ onlyWithImage: e.target.checked })} />
          <label className="form-check-label small" htmlFor="f-image">삽화 있는 것만</label>
        </div>
      </div>
      <p className="small text-secondary mt-2 mb-0" aria-live="polite">전체 {total}개 중 {shown}개 표시</p>
    </div>
  )
}
