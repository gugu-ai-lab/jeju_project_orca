import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Places from './pages/Places'
import Heritage from './pages/Heritage'
import Agent from './pages/Agent'
import GuidePreview from './pages/GuidePreview'
import Explore from './pages/Explore'
import StoryDetail from './pages/StoryDetail'
import My from './pages/My'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

// ── 메뉴 목록 ────────────────────────────────────────────
// 페이지를 추가할 때: ① pages/에 파일 만들기 ② 아래 NAV_ITEMS 에 한 줄 추가 ③ routes 에 한 줄 추가
// 아이콘 이름: https://icons.getbootstrap.com
// ※ Places/Heritage 는 샘플 이름입니다. 자신의 주제에 맞게 바꾸세요.
export const NAV_ITEMS = [
  { to: '/home', label: '홈', icon: 'house' },
  { to: '/explore', label: '이야기 탐험', icon: 'compass' },
  { to: '/places', label: '관광·문화', icon: 'geo-alt' },
  { to: '/heritage', label: '국가유산', icon: 'bank' },
  { to: '/agent', label: '신화안내원', icon: 'robot' },
  { to: '/shop', label: '기념품 가게', icon: 'shop' },
  { to: '/my', label: '내 즐겨찾기', icon: 'star' },
  { to: '/account', label: '로그인', icon: 'person-circle' },
]

export const router = createBrowserRouter([
  { path: '/', element: <Landing />, errorElement: <NotFound /> },   // 도트 게임 느낌의 시작 화면
  {
    element: <RootLayout />,      // 모든 내부 페이지에 공통으로 보이는 틀(메뉴·푸터)
    errorElement: <NotFound />,
    children: [
      { path: 'home', element: <Home /> },
      { path: 'explore', element: <Explore /> },
      { path: 'explore/:storyId', element: <StoryDetail /> },
      { path: 'places', element: <Places /> },
      { path: 'heritage', element: <Heritage /> },
      { path: 'agent', element: <Agent /> },
      { path: 'guide-preview', element: <GuidePreview /> },
      { path: 'shop', element: <Shop /> },
      { path: 'cart', element: <Cart /> },
      { path: 'my', element: <My /> },
      { path: 'account', element: <Account /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
