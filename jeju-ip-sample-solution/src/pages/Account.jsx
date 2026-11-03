import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { useAppStore } from '../store/useAppStore'
import {
  getMythFavorites,
  getMythSupabaseClient,
  isSupabasePreviewReadOnly,
  saveMythFavorite,
} from '../../services/browser-favorites'
import { AccountAuthError, createSupabaseAccount, isAnonymousUser } from '../../services/supabase-account.js'

const redirectUrl = (query) => `${window.location.origin}/account${query}`

function authMessage(error, mode) {
  if (error instanceof AccountAuthError) {
    if (error.code === 'LINK') {
      return '익명 기록을 계정에 연결하지 못했어요. Supabase Authentication에서 익명 로그인과 수동 계정 연결이 켜져 있는지 확인해 주세요.'
    }
    if (error.code === 'LOGIN') return '이메일 또는 비밀번호를 확인해 주세요.'
    if (error.code === 'PASSWORD') return '이메일 인증을 마친 뒤 비밀번호를 설정해 주세요.'
    if (error.code === 'SIGNUP') return '회원가입을 처리하지 못했어요. 이메일이 이미 가입되어 있다면 로그인해 주세요.'
  }
  return mode === 'login' ? '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.' : '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
}

export default function Account() {
  const [client] = useState(() => {
    try { return getMythSupabaseClient() }
    catch { return null }
  })
  const [session, setSession] = useState(null)
  const [mode, setMode] = useState(() => new URLSearchParams(window.location.search).get('finish') === 'password' ? 'set-password' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [guestFavorites, setGuestFavorites] = useState([])
  const [copyGuestFavorites, setCopyGuestFavorites] = useState(false)
  const [busy, setBusy] = useState(Boolean(client))
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(() => new URLSearchParams(window.location.search).get('registered') === '1' ? '이메일 인증 링크를 보냈어요. 메일을 확인해 주세요.' : '')
  const [error, setError] = useState('')
  const [clientError, setClientError] = useState(client ? '' : 'Supabase 설정을 확인할 수 없어요. 프로젝트 URL과 Publishable key 설정을 확인해 주세요.')
  const [readOnly] = useState(isSupabasePreviewReadOnly())
  const loadFavorites = useAppStore((state) => state.loadFavorites)

  const account = useMemo(() => client ? createSupabaseAccount(client) : null, [client])
  const user = session?.user || null
  const anonymous = isAnonymousUser(user)
  const isVerifiedAccount = Boolean(user && !anonymous && user.email)
  const canFinishPassword = mode === 'set-password' && isVerifiedAccount

  useEffect(() => {
    if (!client) return undefined
    let active = true
    const listener = client.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (event === 'SIGNED_OUT') {
        useAppStore.setState({ favorites: [], favError: null, favLoading: false })
      }
    })
    const subscription = listener.data?.subscription
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setClientError('Supabase 계정 상태를 확인할 수 없어요. 환경 설정과 네트워크를 확인해 주세요.')
      else {
        setSession(data.session)
        if (data.session?.user?.email) setEmail(data.session.user.email)
      }
    }).catch(() => {
      if (active) setClientError('Supabase 계정 상태를 확인할 수 없어요. 환경 설정과 네트워크를 확인해 주세요.')
    }).finally(() => { if (active) setBusy(false) })
    return () => { active = false; subscription?.unsubscribe() }
  }, [client])

  useEffect(() => {
    let active = true
    async function loadGuestFavorites() {
      if (!anonymous || readOnly) {
        setGuestFavorites([])
        return
      }
      try {
        const saved = await getMythFavorites().list()
        if (active) setGuestFavorites(saved)
      } catch {
        if (active) setGuestFavorites([])
      }
    }
    loadGuestFavorites()
    return () => { active = false }
  }, [anonymous, readOnly])

  const clearMessages = () => { setError(''); setNotice('') }

  async function submitLogin(event) {
    event.preventDefault()
    clearMessages()
    if (readOnly) return setError('안전 미리보기에서는 계정 변경을 실행하지 않아요.')
    if (!account) return setError(clientError || 'Supabase 설정을 확인해 주세요.')
    setSaving(true)
    try {
      const guestCopy = copyGuestFavorites ? guestFavorites : []
      const result = await account.signIn(email.trim(), password)
      setSession(result.session)
      setPassword('')
      let copied = 0
      for (const favorite of guestCopy) {
        try {
          await saveMythFavorite({ storyId: favorite.storyId, storyTitle: favorite.storyTitle })
          copied += 1
        } catch {
          // 계정 로그인을 유지하고 성공한 항목만 복사 결과에 반영한다.
        }
      }
      await loadFavorites()
      setNotice(guestCopy.length
        ? `로그인했어요. 익명 즐겨찾기 ${copied}/${guestCopy.length}개를 계정에 복사했어요. 원래 익명 기록은 그대로 보존돼요.`
        : '로그인했어요.')
    } catch (cause) {
      setError(authMessage(cause, 'login'))
    } finally {
      setSaving(false)
    }
  }

  async function submitSignup(event) {
    event.preventDefault()
    clearMessages()
    if (readOnly) return setError('안전 미리보기에서는 계정 변경을 실행하지 않아요.')
    if (!account) return setError(clientError || 'Supabase 설정을 확인해 주세요.')
    if (!anonymous && password.length < 8) return setError('비밀번호를 8자 이상 입력해 주세요.')
    if (!anonymous && password !== confirmPassword) return setError('비밀번호 확인이 일치하지 않아요.')
    setSaving(true)
    try {
      if (anonymous) {
        await account.linkAnonymousEmail(email.trim(), redirectUrl('?finish=password'))
        setPassword('')
        setConfirmPassword('')
        setNotice('인증 메일을 보냈어요. 메일의 링크를 누른 다음 이 화면에서 비밀번호를 설정해 주세요. 즐겨찾기는 같은 계정에 이어집니다.')
      } else {
        const result = await account.signUp(email.trim(), password, redirectUrl('?registered=1'))
        setPassword('')
        setConfirmPassword('')
        if (result.session) {
          setSession(result.session)
          await loadFavorites()
          setNotice('회원가입이 완료됐어요.')
        } else {
          setNotice('인증 메일을 보냈어요. 메일을 확인해 가입을 마쳐 주세요.')
        }
      }
    } catch (cause) {
      setError(authMessage(cause, 'signup'))
    } finally {
      setSaving(false)
    }
  }

  async function submitPassword(event) {
    event.preventDefault()
    clearMessages()
    if (password.length < 8) return setError('비밀번호를 8자 이상 입력해 주세요.')
    if (password !== confirmPassword) return setError('비밀번호 확인이 일치하지 않아요.')
    if (readOnly) return setError('안전 미리보기에서는 계정 변경을 실행하지 않아요.')
    setSaving(true)
    try {
      await account.setPassword(password)
      const { data } = await client.auth.getSession()
      setSession(data.session)
      setPassword('')
      setConfirmPassword('')
      setMode('login')
      await loadFavorites()
      setNotice('이메일 인증과 비밀번호 설정을 마쳤어요. 이제 같은 이메일과 비밀번호로 로그인할 수 있어요.')
      window.history.replaceState({}, '', '/account')
    } catch (cause) {
      setError(authMessage(cause, 'signup'))
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    clearMessages()
    if (readOnly) return setError('안전 미리보기에서는 로그아웃 요청을 실행하지 않아요.')
    if (anonymous && !window.confirm('익명 세션을 끝내면 이 브라우저에서 익명 즐겨찾기를 다시 열기 어려울 수 있어요. 계속할까요?')) return
    setSaving(true)
    try {
      await account.signOut()
      setSession(null)
      setGuestFavorites([])
      setPassword('')
      setNotice('로그아웃했어요.')
    } catch (cause) {
      setError(authMessage(cause, 'login'))
    } finally {
      setSaving(false)
    }
  }

  return <>
    <PageHeader icon="person-circle" title="계정" subtitle="회원가입과 로그인을 하면 즐겨찾기를 계정에 이어서 보관할 수 있어요" />
    {readOnly && <Alert variant="info">현재 안전 미리보기에서는 Supabase 계정 변경이 잠겨 있어요.</Alert>}
    {clientError && <Alert variant="warning" role="alert">{clientError}</Alert>}
    {notice && <Alert variant="success" role="status">{notice}</Alert>}
    {error && <Alert variant="warning" role="alert">{error}</Alert>}
    {busy ? <div className="py-5 text-center"><Spinner animation="border" role="status"><span className="visually-hidden">계정 확인 중</span></Spinner></div> :
      <Card className="myth-panel mx-auto" style={{ maxWidth: 560 }}>
        <Card.Body className="p-4">
          {isVerifiedAccount ? <>
            <h2 className="h4">로그인되어 있어요</h2>
            <p className="mb-4">{user.email}</p>
            <Button variant="outline-danger" onClick={logout} disabled={saving || readOnly}>
              {saving ? '처리 중…' : '로그아웃'}
            </Button>
          </> : canFinishPassword ? <>
            <h2 className="h4">비밀번호 설정</h2>
            <p className="text-secondary">이메일 인증을 마쳤어요. 계정에 사용할 비밀번호를 정해 주세요.</p>
            <Form onSubmit={submitPassword}>
              <PasswordFields password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} />
              <Button type="submit" disabled={saving || readOnly}>{saving ? '저장 중…' : '비밀번호 설정'}</Button>
            </Form>
          </> : <>
            {anonymous && <Alert variant="info">익명으로 사용 중이에요. 이메일을 연결하면 현재 이야기와 장소 즐겨찾기가 같은 계정에 이어져요.</Alert>}
            <div className="d-flex gap-2 mb-4" role="group" aria-label="계정 메뉴">
              <Button type="button" variant="outline-primary" active={mode === 'login'} aria-pressed={mode === 'login'} className="flex-fill" onClick={() => { setMode('login'); clearMessages() }}>로그인</Button>
              <Button type="button" variant="outline-primary" active={mode === 'signup'} aria-pressed={mode === 'signup'} className="flex-fill" onClick={() => { setMode('signup'); clearMessages() }}>회원가입</Button>
            </div>
            {mode === 'login' ? <Form onSubmit={submitLogin}>
              <Form.Group className="mb-3" controlId="account-login-email">
                <Form.Label>이메일</Form.Label>
                <Form.Control type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="account-login-password">
                <Form.Label>비밀번호</Form.Label>
                <Form.Control type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
              </Form.Group>
              {anonymous && guestFavorites.length > 0 && <Form.Check className="mb-3" type="checkbox" id="copy-guest-favorites"
                label={`현재 익명 즐겨찾기 ${guestFavorites.length}개를 로그인한 계정에 복사하기`} checked={copyGuestFavorites} onChange={event => setCopyGuestFavorites(event.target.checked)} />}
              {anonymous && guestFavorites.length > 0 && <p className="small text-secondary">복사는 선택 사항이며, 원래 익명 기록은 삭제하지 않아요.</p>}
              <Button type="submit" disabled={saving || readOnly}>{saving ? '로그인 중…' : '로그인'}</Button>
            </Form> : <Form onSubmit={submitSignup}>
              <Form.Group className="mb-3" controlId="account-signup-email">
                <Form.Label>이메일</Form.Label>
                <Form.Control type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
              </Form.Group>
              {anonymous ? <p className="small text-secondary">인증 메일의 링크를 누른 뒤 비밀번호를 설정해요. Supabase에서 익명 로그인과 수동 계정 연결이 활성화되어 있어야 합니다.</p> : <PasswordFields password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} />}
              <Button type="submit" disabled={saving || readOnly}>{saving ? '처리 중…' : anonymous ? '이메일 인증 보내기' : '회원가입'}</Button>
            </Form>}
            <p className="small text-secondary mt-4 mb-0">메일 인증을 사용한다면 Supabase의 허용 리디렉션 주소에 현재 사이트 주소를 등록해 주세요.</p>
          </>}
        </Card.Body>
      </Card>}
  </>
}

function PasswordFields({ password, setPassword, confirmPassword, setConfirmPassword }) {
  return <>
    <Form.Group className="mb-3" controlId="account-password">
      <Form.Label>비밀번호</Form.Label>
      <Form.Control type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} />
    </Form.Group>
    <Form.Group className="mb-3" controlId="account-confirm-password">
      <Form.Label>비밀번호 확인</Form.Label>
      <Form.Control type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
    </Form.Group>
  </>
}
