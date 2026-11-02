import { CATEGORY_LABEL, isVerified } from '../lib/storyFilter'
import { storySymbol } from '../lib/pixelSymbols'

// 이야기 목록 카드 — 표현 전용. story 는 storyCatalog 항목 형식.
// 썸네일: 이야기의 상징 도트 아이콘이 있으면 그것을, 없으면 삽화를, 그것도 없으면 책갈피 아이콘을 쓴다.
export default function StoryCard({ story, selected, onSelect }) {
  const thumb = story.thumbnailImage || story.scenes?.find((s) => s.image)?.image
  const symbol = storySymbol(story.id)
  const verified = isVerified(story)
  return (
    <button type="button" className={`story-card${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={() => onSelect(story.id)}>
      <span className="story-card-thumb" aria-hidden="true" style={symbol ? { background: symbol.bg } : undefined}>
        {symbol ? <span className="story-symbol" style={{ backgroundImage: symbol.url }} /> : thumb ? <img src={typeof thumb === 'string' ? thumb : thumb.src} alt="" loading="lazy" /> : <i className="bi bi-journal-bookmark" />}
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
