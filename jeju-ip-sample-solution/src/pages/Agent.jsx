import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ToolSteps from '../components/ToolSteps'
import { useAppStore } from '../store/useAppStore'
import { fetchAgentStatus, queryTool } from '../api/client'

export default function Agent() {
  const messages = useAppStore(s => s.messages)
  const loading = useAppStore(s => s.chatLoading)
  const sendMessage = useAppStore(s => s.sendMessage)
  const chatError = useAppStore(s => s.chatError)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [tool, setTool] = useState('search_myths')
  const [place, setPlace] = useState('제주시')
  const [keyword, setKeyword] = useState('설문대')
  const [lookup, setLookup] = useState(null)
  const [lookupError, setLookupError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    fetchAgentStatus().then(data => { if (active) setStatus(data) })
      .catch(() => { if (active) setStatusError('AI 상태를 확인하지 못했습니다. 잠시 후 새로고침해 주세요.') })
    return () => { active = false }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    if (!status?.available || !input.trim() || loading) return
    const success = await sendMessage(input.trim())
    if (success) setInput('')
  }
  async function onLookup(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setLookupError(''); setLookup(null)
    try { setLookup(await queryTool(tool, tool === 'get_weather' ? { place } : { keyword })) }
    catch (error) { setLookupError(error.message) }
    finally { setBusy(false) }
  }

  return <>
    <PageHeader icon="robot" title="신화 여행 안내원" subtitle="이야기의 근거와 장소를 공공데이터에서 찾습니다" />
    <div role="status">
      {!status && !statusError && <p>AI 설정 상태를 확인하고 있습니다…</p>}
      {statusError && <Alert variant="warning">{statusError}</Alert>}
      {status && !status.available && <Alert variant="info">
        AI 안내원은 설정 대기 중입니다. {status.reason === 'key_missing' ? 'OpenAI API 키를 설정하면 활성화됩니다.' : 'AI 설정을 확인해 주세요.'}
        <div>다른 메뉴와 아래 직접 자료 조회는 계속 이용할 수 있습니다.</div>
      </Alert>}
    </div>
    <Card className="mb-4"><Card.Body>
      <Card.Title>공공데이터 도구</Card.Title>
      {status?.model && <p className="small text-muted">OpenAI · {status.model} · 질문당 모델 요청 최대 4회 / 도구 실행 최대 3회</p>}
      <ul>{status?.tools.map(t => <li key={t.name}><code>{t.name}</code> · {t.source}
        <Badge bg={t.configured ? 'secondary' : 'warning'} className="ms-2">{t.configured ? '조회 설정 준비됨 · 응답 검증 별도' : '인증 설정 대기'}</Badge>
      </li>)}</ul>
      <p className="small text-muted">AI는 질문에 따라 필요한 도구를 선택하고, 결과를 확인한 뒤 출처와 함께 답합니다.</p>
    </Card.Body></Card>
    <Card className="chat-box mb-3"><Card.Body aria-live="polite">
      {messages.length === 0 && <p className="text-muted">예: 설문대할망 자료와 관련 역사문화를 찾아주고 제주시 날씨도 확인해 줘.</p>}
      {messages.map((m, i) => <div key={i} className={'msg ' + m.role}>
        <div className="small fw-bold">{m.role === 'user' ? '나' : 'AI 안내원'}</div>
        <p style={{ whiteSpace: 'pre-wrap' }}>{m.text}</p>
        {m.role === 'assistant' && <ToolSteps steps={m.steps} />}
      </div>)}
      {loading && <p><Spinner size="sm" /> AI가 자료를 확인하고 있습니다…</p>}
    </Card.Body></Card>
    {chatError && <Alert variant="warning" role="alert">{chatError.message}<ToolSteps steps={chatError.steps} /></Alert>}
    <Form onSubmit={onSubmit} className="mb-5">
      <Form.Label htmlFor="agent-question">신화 여행 질문</Form.Label>
      <InputGroup>
        <Form.Control id="agent-question" value={input} maxLength={1500} onChange={e => setInput(e.target.value)}
          disabled={!status?.available || loading} placeholder="어떤 제주 이야기를 탐험하고 싶나요?" />
        <Button type="submit" disabled={!status?.available || loading || !input.trim()}>질문하기</Button>
      </InputGroup>
    </Form>
    <Card><Card.Body>
      <Card.Title>직접 자료 조회</Card.Title>
      <p>OpenAI 키 없이 공공데이터 도구를 직접 조회합니다. AI의 자율 호출과는 별개입니다.</p>
      <Form onSubmit={onLookup}>
        <Form.Label htmlFor="tool-select">조회할 도구</Form.Label>
        <Form.Select id="tool-select" value={tool} onChange={e => setTool(e.target.value)} className="mb-2">
          <option value="search_myths">제주신화정보</option><option value="search_culture">역사문화일반정보</option>
          <option value="search_locations">역사문화위치정보</option><option value="get_weather">기상청 단기예보</option>
        </Form.Select>
        <Form.Label htmlFor="tool-keyword">{tool === 'get_weather' ? '예보 지역' : '검색어'}</Form.Label>
        <InputGroup>{tool === 'get_weather'
          ? <Form.Select id="tool-keyword" value={place} onChange={e => setPlace(e.target.value)}><option>제주시</option><option>서귀포시</option></Form.Select>
          : <Form.Control id="tool-keyword" value={keyword} maxLength={80} onChange={e => setKeyword(e.target.value)} />}
          <Button type="submit" disabled={busy}>{busy ? '조회 중…' : '자료 조회'}</Button></InputGroup>
      </Form>
      {lookupError && <Alert variant="warning" className="mt-3" role="alert">{lookupError}</Alert>}
      {lookup && <div aria-live="polite" className="mt-3">
        <p>{lookup.source} · {lookup.count}건 · 조회 시각 {new Date(lookup.fetchedAt).toLocaleString('ko-KR')}</p>
        {!lookup.complete && <Alert variant="warning">일부 자료 범위에서 검색한 결과입니다.</Alert>}
        {lookup.items.length === 0 ? <p>검색 결과가 없습니다.</p> : <ul>{lookup.items.map(p =>
          <li key={p.id}><strong>{p.title}</strong>{p.description && <p>{p.description}</p>}
            {p.time && <p>{p.sky || '하늘 정보 없음'} · 기온 {p.temp ?? '—'}°C · 강수확률 {p.pop ?? '—'}%</p>}
            {p.latitude && p.longitude && <span> · 좌표 {p.latitude}, {p.longitude}</span>}
            <div className="small text-muted">{p.publisher || p.source}{p.copyright && ' · 저작권: ' + p.copyright}</div></li>)}</ul>}
      </div>}
    </Card.Body></Card>
  </>
}
