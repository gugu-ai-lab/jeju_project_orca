import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Alert, Button, Container, Form, Nav, Navbar, Toast, ToastContainer } from 'react-bootstrap'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'
import PixelBackdrop from '../components/PixelBackdrop'
import MotionToggle from '../components/MotionToggle'
import CartNavLink from '../components/CartNavLink'
import CartToast from '../components/CartToast'
import { verifyGuestbookAdmin } from '../../services/browser-guestbook.js'
import { getGuestbookAdminPassword, setGuestbookAdminPassword, subscribeGuestbookAdmin } from '../../services/guestbook-admin-session.js'

export default function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [adminPopoverOpen, setAdminPopoverOpen] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoginBusy, setAdminLoginBusy] = useState(false)
  const adminPassword = useSyncExternalStore(subscribeGuestbookAdmin, getGuestbookAdminPassword, getGuestbookAdminPassword)
  const mainNavItems = NAV_ITEMS.filter((item) => !['/my', '/guestbook'].includes(item.to))
  const iconNavItems = NAV_ITEMS.filter((item) => ['/my', '/guestbook'].includes(item.to))
  const activeItem = NAV_ITEMS.find((item) => location.pathname === item.to || (item.to === '/explore' && location.pathname.startsWith('/explore/')))
  const activeKey = activeItem?.to || (location.pathname === '/cart' ? '/cart' : '__none__')
  const toasts = useAppStore((s) => s.toasts)
  const nickname = useAppStore((s) => s.nickname)

  async function submitAdminLogin(event) {
    event.preventDefault()
    setAdminLoginError('')
    setAdminLoginBusy(true)
    try {
      await verifyGuestbookAdmin(adminPasswordInput)
      setGuestbookAdminPassword(adminPasswordInput)
      setAdminPasswordInput('')
      setAdminPopoverOpen(false)
      if (location.pathname !== '/guestbook') navigate('/guestbook')
    } catch (error) {
      setAdminLoginError(error?.message || '관리자 확인에 실패했어요.')
    } finally {
      setAdminLoginBusy(false)
    }
  }

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 320)
    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100 has-pixel-backdrop">
      <PixelBackdrop />
      <CartToast />
      <Navbar expand="md" className="jeju-nav" collapseOnSelect sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" title="시작 화면으로">
            <span className="brand-mark" aria-hidden="true" />
            <span className="font-myth">탐라 이야기길</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto nav-main-links" activeKey={activeKey}>
              {mainNavItems.map((item) => (
                <Nav.Link key={item.to} as={NavLink} to={item.to} end={item.to !== '/explore'} eventKey={item.to}>
                  <i className={`bi bi-${item.icon} me-1`} aria-hidden="true" />{item.label}
                </Nav.Link>
              ))}
            </Nav>
            {nickname && (
              <Navbar.Text className="me-md-3"><i className="bi bi-person-circle me-1" />{nickname}</Navbar.Text>
            )}
            <Nav className="nav-icon-links ms-md-auto" activeKey={activeKey}>
              {iconNavItems.map((item) => (
                <Nav.Link key={item.to} as={NavLink} to={item.to} eventKey={item.to}
                  title={item.to === '/guestbook' ? '방명록' : '내 즐겨찾기'}
                  aria-label={item.to === '/guestbook' ? '방명록' : '내 즐겨찾기'}>
                  <i className={`bi bi-${item.icon} nav-icon-strong`} aria-hidden="true" />
                  <span className="visually-hidden">{item.to === '/guestbook' ? '방명록' : '내 즐겨찾기'}</span>
                </Nav.Link>
              ))}
              <CartNavLink />
              <div className="nav-admin-control">
                <button type="button" className="nav-link nav-admin-toggle" aria-expanded={adminPopoverOpen}
                  aria-label={adminPassword ? '관리자 모드 메뉴' : '방명록 관리자 로그인'} title={adminPassword ? '관리자 모드' : '관리자 로그인'}
                  onClick={() => { if (adminPopoverOpen) setAdminPasswordInput(''); setAdminPopoverOpen(open => !open); setAdminLoginError('') }}>
                  <i className={`bi bi-${adminPassword ? 'shield-lock-fill' : 'shield-lock'} nav-icon-strong`} aria-hidden="true" />
                  <span className="visually-hidden">{adminPassword ? '관리자 모드 메뉴' : '관리자 로그인'}</span>
                </button>
                {adminPopoverOpen && <div className="guestbook-admin-popover" role="dialog" aria-label="방명록 관리자 로그인">
                  {adminPassword
                    ? <>
                      <p className="mb-2 fw-bold">관리자로 로그인되어 있어요.</p>
                      <Button size="sm" className="w-100" onClick={() => { setAdminPopoverOpen(false); if (location.pathname !== '/guestbook') navigate('/guestbook') }}>방명록 열기</Button>
                      <Button size="sm" variant="outline-secondary" className="w-100 mt-2" onClick={() => { setGuestbookAdminPassword(''); setAdminPopoverOpen(false) }}>로그아웃</Button>
                    </>
                    : <Form onSubmit={submitAdminLogin}>
                      <Form.Label htmlFor="header-admin-password" className="fw-bold">관리자 비밀번호</Form.Label>
                      <Form.Control id="header-admin-password" type="password" className="guestbook-admin-password mb-2"
                        autoComplete="current-password" autoFocus required value={adminPasswordInput}
                        onChange={event => setAdminPasswordInput(event.target.value)} placeholder="비밀번호 입력" />
                      {adminLoginError && <Alert variant="warning" className="py-2 px-2 mb-2" role="alert">{adminLoginError}</Alert>}
                      <Button type="submit" size="sm" className="w-100" disabled={adminLoginBusy}>
                        {adminLoginBusy ? '확인 중…' : '관리자 로그인'}
                      </Button>
                    </Form>}
                </div>}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 py-4">
        <Container>
          <Outlet />   {/* ← 여기에 주소에 맞는 페이지가 들어갑니다 */}
        </Container>
      </main>

      <footer className="py-3 jeju-footer">
        <Container className="small">
          제주 신화·전설 AI 관광 안내 · 신화 삽화·설명: 제주특별자치도 「제주신화전설 삽화 정보」(공공데이터포털, 공공저작물 자유이용 제0유형)
          <MotionToggle className="ms-md-3" />
        </Container>
      </footer>

      {showBackToTop && <button type="button" className="back-to-top" aria-label="맨 위로 이동" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="bi bi-arrow-up" aria-hidden="true" /> 맨 위로
      </button>}

      {/* 스토어의 toast() 로 띄운 알림 */}
      <ToastContainer position="bottom-end" className="p-3 position-fixed">
        {toasts.map((t) => (
          <Toast key={t.id} bg={t.variant}>
            <Toast.Body className="text-white">{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
  )
}
