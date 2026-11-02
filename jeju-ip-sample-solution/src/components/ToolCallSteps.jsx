// 도구 호출 과정 표시 — 표현 전용.
// steps: [{ name, args?, status?: 'running'|'ok'|'empty'|'error', count?, message? }]
// 모든 필드는 선택이며, 없는 값은 그리지 않는다(특정 API 응답 구조를 가정하지 않음).
const STATUS = {
  running: { label: '호출 중', icon: 'hourglass-split', cls: 'is-running' },
  ok: { label: '완료', icon: 'check-circle-fill', cls: 'is-ok' },
  empty: { label: '결과 없음', icon: 'dash-circle', cls: 'is-empty' },
  error: { label: '실패', icon: 'x-circle-fill', cls: 'is-error' },
}

function formatArgs(args) {
  if (args == null || args === '') return null
  if (typeof args === 'string') return args
  try { return JSON.stringify(args) } catch { return String(args) }
}

export default function ToolCallSteps({ steps }) {
  if (!steps?.length) return null
  return (
    <details className="tool-steps" open>
      <summary><i className="bi bi-tools me-1" />안내원이 호출한 도구 {steps.length}개</summary>
      <ol>
        {steps.map((s, i) => {
          const st = STATUS[s.status]
          const args = formatArgs(s.args)
          return (
            <li key={i} className={`tool-step ${st?.cls ?? ''}`}>
              <code className="tool-name">{s.name ?? '(이름 없음)'}</code>
              {st && <span className="tool-status"><i className={`bi bi-${st.icon} me-1`} />{st.label}</span>}
              {s.count != null && <span className="tool-count">{s.count}건</span>}
              {args && <span className="tool-args">{args}</span>}
              {s.message && <span className="tool-message">{s.message}</span>}
              {s.source && <div className="small text-secondary">{s.sourceUrl ? <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">{s.source}</a> : s.source}</div>}
              {s.fetchedAtKst && <div className="small text-secondary">조회: {s.fetchedAtKst}</div>}
              {s.preview?.length > 0 && <details><summary>조회 결과 보기</summary><ul>
                {s.preview.map((p, n) => <li key={p.id || n}>
                  {p.title || p.place}{p.description && <p>{p.description}</p>}
                  {p.address && <div>{p.address}</div>}
                  {p.latitude && p.longitude && <div>좌표 {p.latitude}, {p.longitude}</div>}
                  {p.time && <div>{p.time} · {p.sky} · {p.temp ?? '—'}°C · 강수확률 {p.pop ?? '—'}%</div>}
                </li>)}
              </ul></details>}
            </li>
          )
        })}
      </ol>
    </details>
  )
}
