import { Link, NavLink, Outlet } from 'react-router-dom'
import { Container, Nav, Navbar, Toast, ToastContainer } from 'react-bootstrap'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'
import PixelBackdrop from '../components/PixelBackdrop'
import MotionToggle from '../components/MotionToggle'

export default function RootLayout() {
  const toasts = useAppStore((s) => s.toasts)
  const nickname = useAppStore((s) => s.nickname)

  return (
    <div className="d-flex flex-column min-vh-100 has-pixel-backdrop">
      <PixelBackdrop />
      <Navbar expand="md" className="jeju-nav" collapseOnSelect sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" title="시작 화면으로">
            <span className="brand-mark" aria-hidden="true" />
            <span className="font-myth">탐라 이야기길</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              {NAV_ITEMS.map((item) => (
                <Nav.Link key={item.to} as={NavLink} to={item.to} end={item.to === '/home'} eventKey={item.to}>
                  <i className={`bi bi-${item.icon} me-1`} />{item.label}
                </Nav.Link>
              ))}
            </Nav>
            {nickname && (
              <Navbar.Text><i className="bi bi-person-circle me-1" />{nickname}</Navbar.Text>
            )}
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
