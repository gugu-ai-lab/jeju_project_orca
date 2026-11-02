// 자료 출처 표시 — 이야기·이미지 어디서나 같은 형태로 쓴다. source = { label, url, license }
export default function SourceCredit({ source }) {
  if (!source) return null
  return (
    <p className="source-credit">
      <i className="bi bi-info-circle me-1" />
      출처:{' '}
      {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a> : source.label}
      {source.license && <> · 이용허락범위 {source.license}</>}
    </p>
  )
}
