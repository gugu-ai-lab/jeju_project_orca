import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Container, Nav, Navbar, Toast, ToastContainer } from 'react-bootstrap'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'
import PixelBackdrop from '../components/PixelBackdrop'
import MotionToggle from '../components/MotionToggle'
import CartNavLink from '../components/CartNavLink'
import CartToast from '../components/CartToast'

export default function RootLayout() {
  const location = useLocation()
  const [showBackToTop, setShowBackToTop] = useState(false)
  const mainNavItems = NAV_ITEMS.filter((item) => !['/my', '/guestbook'].includes(item.to))
  const iconNavItems = NAV_ITEMS.filter((item) => ['/my', '/guestbook'].includes(item.to))
  const activeItem = NAV_ITEMS.find((item) => location.pathname === item.to || (item.to === '/explore' && location.pathname.startsWith('/explore/')))
  const activeKey = activeItem?.to || (location.pathname === '/cart' ? '/cart' : '__none__')
  const toasts = useAppStore((s) => s.toasts)
  const nickname = useAppStore((s) => s.nickname)

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
              <Nav.Link as={Link} to="/guestbook" state={{ openGuestbookAdmin: true }}
                title="관리자 로그인" aria-label="방명록 관리자 로그인">
                <i className="bi bi-shield-lock nav-icon-strong" aria-hidden="true" />
                <span className="visually-hidden">관리자 로그인</span>
              </Nav.Link>
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
