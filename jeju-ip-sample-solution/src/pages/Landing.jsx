import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PixelScene from '../components/PixelScene'
import MotionToggle from '../components/MotionToggle'
import '../styles/landing.css'

// 랜딩 — 2D 도트 게임 타이틀 화면처럼 시작해서 홈(/home)으로 들어간다.
export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/home') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <main className="landing">
      <PixelScene />
      <div className="landing-ui">
        <p className="landing-tag">제주 신화 · 전설 탐험</p>
        <h1 className="landing-title">탐라 이야기길</h1>
        <p className="landing-sub">신화와 전설을 따라 제주를 걷는 여행</p>
        <Link to="/home" className="pixel-btn" autoFocus>
          <span className="pixel-cursor" aria-hidden="true">▶</span> 여행 시작하기
        </Link>
        <p className="landing-hint">Enter 키를 눌러도 시작돼요</p>
      </div>
      <MotionToggle className="motion-toggle-fixed" />
    </main>
  )
}
