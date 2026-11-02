import { Alert, Badge, Table } from 'react-bootstrap'

export default function ToolSteps({ steps = [] }) {
  if (!steps.length) return <p className="small text-muted">호출된 도구가 없습니다.</p>
  return <Table responsive size="sm" aria-label="도구 호출 내역">
    <thead><tr><th>도구 / 검색어</th><th>결과</th><th>출처</th></tr></thead>
    <tbody>{steps.map((s, i) => <tr key={i}>
      <td><code>{s.tool}</code><div>{s.args?.place || s.args?.keyword || '전체 자료'}</div></td>
      <td><Badge bg={s.status === 'success' ? 'success' : 'danger'}>{s.status === 'success' ? '성공' : '실패'}</Badge>
        {s.status === 'success' && <span className="ms-2">{s.count}건 · {s.durationMs}ms</span>}
        {s.complete === false && <div>일부 자료 범위에서 검색</div>}
        {s.preview?.length > 0 && <details className="mt-2"><summary>조회 결과 보기</summary><ul>{s.preview.map((p, n) =>
          <li key={n}>{p.title || p.place}{p.description && <p>{p.description}</p>}
            {p.time && <span> · {p.sky || '—'} · {p.temp ?? '—'}°C · 강수확률 {p.pop ?? '—'}%</span>}</li>)}</ul></details>}
        {s.error && <Alert variant="warning" className="mt-2 mb-0">{s.error}</Alert>}
      </td><td>{s.source || '—'}</td>
    </tr>)}</tbody>
  </Table>
}
