// 장면 이동 — 표현 전용. total <= 1 이면 아무것도 그리지 않는다.
export default function SceneNav({ index, total, onChange }) {
  if (total <= 1) return null
  return (
    <nav className="scene-nav" aria-label="이야기 장면 이동">
      <button type="button" className="btn btn-outline-sea btn-sm" disabled={index === 0} onClick={() => onChange(index - 1)}>
        <i className="bi bi-chevron-left" /> 이전
      </button>
      <span className="scene-dots" role="group" aria-label={`장면 ${index + 1} / ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`scene-dot${i === index ? ' is-active' : ''}`}
            aria-label={`장면 ${i + 1}`}
            aria-current={i === index}
            onClick={() => onChange(i)}
          />
        ))}
      </span>
      <button type="button" className="btn btn-primary btn-sm" disabled={index === total - 1} onClick={() => onChange(index + 1)}>
        다음 <i className="bi bi-chevron-right" />
      </button>
    </nav>
  )
}
