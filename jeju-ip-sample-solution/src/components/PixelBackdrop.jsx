import { useEffect, useMemo, useRef } from 'react'
import { drawClouds } from '../lib/pixelScene'
import { drawBoat, drawIsland, seaTileUrl, waveTileUrl } from '../lib/pixelSea'

// 내부 화면 뒤에 깔리는 움직이는 도트 배경 — 표현 전용. 클릭을 막지 않고 내용 뒤에만 보인다.
// 구름 2겹(속도 차이) + 날아가는 새 + 반짝이는 점 + 아래쪽 바다·섬·돛단배(바다는 하나뿐이고 스크롤을 따라온다). 움직임 줄이기 설정은 theme.css 전역 규칙이 처리한다.
const BIRD = ['x.....x', 'xx...xx', '.xxxxx.', '..xxx..'] // 날개 위
const BIRD_DOWN = ['..xxx..', '.xxxxx.', 'xx...xx', 'x.....x'] // 날개 아래

function birdSprite() {
  const c = document.createElement('canvas'); c.width = 16; c.height = 4
  const ctx = c.getContext('2d'); ctx.fillStyle = '#1d4a45'
  ;[BIRD, BIRD_DOWN].forEach((frame, f) => frame.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') ctx.fillRect(f * 8 + x, y, 1, 1) })))
  return c.toDataURL()
}

function seeded(n) { let a = n; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296 } }

export default function PixelBackdrop() {
  const root = useRef(null)
  const cloudA = useRef(null)
  const cloudB = useRef(null)
  const islandBig = useRef(null)
  const islandSmall = useRef(null)
  const boat = useRef(null)
  useEffect(() => {
    drawClouds(cloudA.current, 7); drawClouds(cloudB.current, 19)
    drawIsland(islandBig.current, { cx: 36, hw: 34, H: 20, seed: 5 })
    drawIsland(islandSmall.current, { cx: 20, hw: 17, H: 11, seed: 9, crater: false })
    drawBoat(boat.current)
    const el = root.current, url = birdSprite()
    el.querySelectorAll('.px-bird').forEach((b) => { b.style.backgroundImage = `url(${url})` })
    el.querySelector('.px-sea-base').style.backgroundImage = seaTileUrl()
    el.querySelector('.px-sea-waves').style.backgroundImage = waveTileUrl(0)
    el.querySelector('.px-sea-waves2').style.backgroundImage = waveTileUrl(1)
  }, [])
  const sparkles = useMemo(() => { const r = seeded(11); return Array.from({ length: 16 }, () => ({ x: r() * 100, y: r() * 60, d: r() * 4 })) }, [])

  return (
    <div className="pixel-backdrop" aria-hidden="true" ref={root}>
      <div className="px-layer px-clouds-far"><canvas ref={cloudB} width={640} height={80} /></div>
      <div className="px-layer px-clouds-near"><canvas ref={cloudA} width={640} height={80} /></div>
      {sparkles.map((s, i) => <span key={i} className="px-sparkle" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />)}
      {[0, 1, 2].map((i) => <span key={i} className={`px-bird px-bird-${i}`} />)}
      <div className="px-sea px-sea-base" />
      <div className="px-sea px-sea-waves" />
      <canvas ref={islandSmall} className="px-island px-island-small" width={40} height={28} />
      <canvas ref={islandBig} className="px-island px-island-big" width={72} height={32} />
      <canvas ref={boat} className="px-boat" width={14} height={8} />
      <div className="px-sea px-sea-waves2" /> {/* 앞쪽 물결: 섬 밑동·배 앞을 지나간다 */}
    </div>
  )
}
