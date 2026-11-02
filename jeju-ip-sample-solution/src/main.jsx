import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

// ── 디자인 ───────────────────────────────────────────────
// Bootstrap 5 기본 CSS 위에 styles/theme.css 가 제주 신화 테마를 덧입힌다.
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/theme.css'
import './styles/pixel-theme.css' // 도트 게임 테마 — 이 줄을 빼면 이전 디자인으로 돌아간다

import { router } from './router'
import { initMotion } from './lib/motion'

initMotion()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
