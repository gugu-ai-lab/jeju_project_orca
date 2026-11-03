import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { addGuestbookPost, listGuestbookPosts } from '../../services/browser-guestbook.js'
import { isSupabasePreviewReadOnly } from '../../services/browser-favorites.js'

const COOLDOWN_SECONDS = 30

export default function Guestbook() {
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const readOnly = isSupabasePreviewReadOnly()

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setPosts(await listGuestbookPosts()) }
    catch (cause) { setError(cause?.message || '방명록을 불러오지 못했어요.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    listGuestbookPosts().then(items => {
      if (active) setPosts(items)
    }).catch(cause => {
      if (active) setError(cause?.message || '방명록을 불러오지 못했어요.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (cooldown < 1) return undefined
    const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSending(true)
    try {
      const post = await addGuestbookPost({ nickname, message })
      setPosts(current => [post, ...current].slice(0, 50))
      setMessage('')
      setCooldown(COOLDOWN_SECONDS)
      setNotice('이야기를 남겼어요! 다른 친구들도 볼 수 있어요.')
    } catch (cause) {
      setError(cause?.message || '글을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSending(false)
    }
  }

  return <>
    <PageHeader icon="journal-text" title="여행자 방명록" subtitle="제주 신화 탐험에서 만난 이야기를 친구들과 나눠요" />
    <Card className="myth-panel mb-4">
      <Card.Body>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3" controlId="guestbook-nickname">
            <Form.Label>별명</Form.Label>
            <Form.Control required maxLength={16} value={nickname} onChange={event => setNickname(event.target.value)} placeholder="별명을 적어 주세요" />
            <Form.Text>최대 16자 · 같은 별명을 다른 사람도 쓸 수 있어요.</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="guestbook-message">
            <Form.Label>남길 이야기</Form.Label>
            <Form.Control as="textarea" rows={3} required maxLength={300} value={message} onChange={event => setMessage(event.target.value)} placeholder="오늘 알게 된 신화나 여행 소감을 적어 주세요" />
            <Form.Text>{Array.from(message).length}/300자</Form.Text>
          </Form.Group>
          {error && <Alert variant="warning" role="alert">{error}</Alert>}
          {notice && <Alert variant="success" role="status">{notice}</Alert>}
          {readOnly && <Alert variant="info">안전 미리보기에서는 글을 등록할 수 없어요.</Alert>}
          <Button type="submit" disabled={sending || cooldown > 0 || readOnly}>
            {sending ? '등록 중…' : cooldown > 0 ? `${cooldown}초 뒤 다시 쓰기` : '방명록에 남기기'}
          </Button>
        </Form>
      </Card.Body>
    </Card>

    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="h4 mb-0 guestbook-list-title">친구들이 남긴 이야기</h2>
      <Button variant="outline-primary" size="sm" onClick={refresh} disabled={loading}>새로고침</Button>
    </div>
    {loading ? <div className="py-4 text-center"><Spinner animation="border" role="status"><span className="visually-hidden">방명록 불러오는 중</span></Spinner></div>
      : error ? <Alert variant="warning">방명록 목록을 표시할 수 없어요. 위 안내를 확인해 주세요.</Alert>
        : posts.length === 0 ? <Card className="myth-panel"><Card.Body className="text-center text-secondary">아직 남겨진 이야기가 없어요. 첫 번째 이야기를 적어 볼까요?</Card.Body></Card>
          : <div className="d-grid gap-3">{posts.map(post => <Card className="myth-panel" key={post.id}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                <strong>{post.nickname}</strong>
                <time className="small text-secondary text-end" dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              </div>
              <p className="mb-0 text-break" style={{ whiteSpace: 'pre-wrap' }}>{post.message}</p>
            </Card.Body>
          </Card>)}</div>}
  </>
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })
}
