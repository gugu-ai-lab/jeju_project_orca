import { Link } from 'react-router-dom'
// 부드러운 파스텔 톤의 제주 신화 그림책 일러스트 (강한 원색 없이 아이보리·파스텔 하늘·블루그린 조화)
function PastelMythIllustration({ id, icon }) {
  switch (id) {
    case 'seolmundae':
      return (
        <svg viewBox="0 0 160 110" className="pastel-illo" aria-hidden="true">
          <circle cx="126" cy="28" r="14" fill="#FFFDF7" opacity="0.9" />
          <path d="M18 92 Q52 38 86 92 Z" fill="#4FA3B7" opacity="0.35" />
          <path d="M46 92 Q84 26 122 92 Z" fill="#2F5D50" opacity="0.75" />
          <ellipse cx="84" cy="40" rx="11" ry="4.5" fill="#A9D7F3" />
          <path d="M98 92 Q120 58 142 92 Z" fill="#4FA3B7" opacity="0.6" />
          <path d="M24 28 C38 22, 54 22, 66 28 C58 34, 34 34, 24 28 Z" fill="#FFFDF7" />
        </svg>
      )
    case 'samsinin':
      return (
        <svg viewBox="0 0 160 110" className="pastel-illo" aria-hidden="true">
          <circle cx="48" cy="76" r="14" fill="#4FA3B7" opacity="0.28" />
          <circle cx="80" cy="72" r="16" fill="#4FA3B7" opacity="0.42" />
          <circle cx="112" cy="76" r="14" fill="#4FA3B7" opacity="0.28" />
          <path d="M45 64 L68 26 M80 60 L80 20 M115 64 L92 26" stroke="#2F5D50" strokeWidth="3.2" strokeLinecap="round" />
          <polygon points="68,22 61,30 71,32" fill="#2F5D50" />
          <polygon points="80,16 75,26 85,26" fill="#2F5D50" />
          <polygon points="92,22 89,32 99,30" fill="#2F5D50" />
          <circle cx="80" cy="46" r="4" fill="#F28C28" />
        </svg>
      )
    case 'honinji':
      return (
        <svg viewBox="0 0 160 110" className="pastel-illo" aria-hidden="true">
          <ellipse cx="80" cy="78" rx="52" ry="16" fill="#A9D7F3" opacity="0.65" />
          <ellipse cx="80" cy="78" rx="36" ry="10" fill="#4FA3B7" opacity="0.45" />
          <rect x="64" y="42" width="32" height="22" rx="6" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="2.5" />
          <path d="M64 52 H96" stroke="#4FA3B7" strokeWidth="2.5" />
          <path d="M80 42 C80 28, 70 24, 68 32 C68 38, 76 41, 80 42 Z" fill="#2F5D50" />
          <path d="M80 42 C80 28, 90 24, 92 32 C92 38, 84 41, 80 42 Z" fill="#4FA3B7" />
        </svg>
      )
    case 'jacheongbi':
      return (
        <svg viewBox="0 0 160 110" className="pastel-illo" aria-hidden="true">
          <path d="M52 56 H108 L100 84 C98 88, 62 88, 60 84 Z" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="2.5" />
          <path d="M62 56 C62 36, 98 36, 98 56" fill="none" stroke="#2F5D50" strokeWidth="2.5" />
          <circle cx="70" cy="48" r="5" fill="#F28C28" opacity="0.85" />
          <circle cx="80" cy="44" r="5.5" fill="#4FA3B7" />
          <circle cx="90" cy="48" r="5" fill="#2F5D50" opacity="0.8" />
          <path d="M40 32 Q46 22 52 32 M108 32 Q114 22 120 32" stroke="#4FA3B7" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'suwolbong':
      return (
        <svg viewBox="0 0 160 110" className="pastel-illo" aria-hidden="true">
          <path d="M26 88 L26 42 Q56 36 78 52 L86 88 Z" fill="#2F5D50" opacity="0.72" />
          <path d="M30 54 H72 M30 66 H78 M30 78 H82" stroke="#FFFDF7" strokeWidth="2" opacity="0.7" />
          <path d="M108 30 C108 30, 94 52, 94 62 A14 14 0 0 0 122 62 C122 52, 108 30, 108 30 Z" fill="#4FA3B7" opacity="0.75" />
          <circle cx="112" cy="58" r="3.5" fill="#FFFDF7" />
        </svg>
      )
    case 'sanbangdeok':
      return (
        <svg viewBox="0 0 160 110" className="pastel-illo" aria-hidden="true">
          <path d="M30 88 C38 34, 122 34, 130 88 Z" fill="#2F5D50" opacity="0.72" />
          <path d="M66 88 C66 64, 94 64, 94 88 Z" fill="#FFFDF7" />
          <circle cx="80" cy="76" r="5" fill="#4FA3B7" />
          <path d="M22 88 H138" stroke="#4FA3B7" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'yeongdeung':
      return (
        <svg viewBox="0 0 160 110" className="pastel-illo" aria-hidden="true">
          <path d="M26 44 C52 30, 82 56, 114 38 C126 32, 134 38, 128 46" fill="none" stroke="#4FA3B7" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 62 C60 50, 90 72, 124 56" fill="none" stroke="#2F5D50" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="56" cy="78" r="6" fill="#FFFDF7" stroke="#4FA3B7" strokeWidth="2" />
          <circle cx="86" cy="82" r="5" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="2" />
          <circle cx="112" cy="76" r="6" fill="#FFFDF7" stroke="#4FA3B7" strokeWidth="2" />
        </svg>
      )
    default:
      return <i className={`bi bi-${icon || 'stars'} fs-1`} />
  }
}

// 신화 선택 카드 — 학생 눈높이에 맞춰 [부드러운 일러스트 + 신화 제목 + 호기심 질문] 3요소만 간결하게 표시한다.
export default function MythCard({ myth, selected, onSelect }) {
  return (
    <article className={`myth-card tone-${myth.tone || 'sky'}${selected ? ' is-selected' : ''}`}>
      <button type="button" className="myth-card-select" aria-pressed={selected} onClick={() => onSelect(myth.id)}>
      <span className="myth-art" aria-hidden="true">
        {myth.tag && <span className="myth-mini-tag">{myth.tag}</span>}
        {myth.mapPin ? (
          <span className="myth-loc-badge">
            {myth.mapPin.hasLocation === false
              ? '🌾 전역 전승'
              : `📍 ${myth.mapPin.shortPlace}`}
          </span>
        ) : null}
        <PastelMythIllustration id={myth.id} icon={myth.icon} />
      </span>
      <span className="myth-body">
        <span className="myth-title">{myth.title}</span>
        <span className="myth-question">{myth.question || `${myth.place}에는 어떤 이야기가 숨어 있을까요?`}</span>
      </span>
      </button>
      <Link className="btn btn-outline-sea btn-sm mt-3 align-self-end" to={`/explore/${myth.id}`} aria-label={`${myth.title} 자세히 보기`}>
        자세히 보기
      </Link>
    </article>
  )
}
