import { CATEGORY_LABEL, isVerified } from '../lib/storyFilter'

// 이야기 목록 카드 — 표현 전용. story 는 storyCatalog 항목 형식.
export default function StoryCard({ story, selected, onSelect }) {
  const thumb = story.scenes?.find((s) => s.image)?.image
  const verified = isVerified(story)
  return (
    <button type="button" className={`story-card${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={() => onSelect(story.id)}>
      <span className="story-card-thumb" aria-hidden="true">
        {thumb ? <img src={thumb.src} alt="" loading="lazy" /> : <i className="bi bi-journal-bookmark" />}
      </span>
      <span className="story-card-body">
        <span className="d-flex flex-wrap gap-1">
          <span className="chip">{CATEGORY_LABEL[story.category]}</span>
          <span className={`chip ${verified ? 'chip-ok' : 'chip-wait'}`}>{verified ? '출처 확인됨' : '출처 검증 대기'}</span>
        </span>
        <span className="story-card-title font-myth">{story.title}</span>
        {story.place && <span className="story-card-meta"><i className="bi bi-geo-alt me-1" />{story.place}</span>}
        {story.summary && <span className="story-card-meta">{story.summary}</span>}
      </span>
    </button>
  )
}
