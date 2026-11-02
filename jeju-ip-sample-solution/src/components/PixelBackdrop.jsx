import { useEffect, useMemo, useRef } from 'react'
import { drawClouds } from '../lib/pixelScene'
import { drawBoat, drawIsland, fishSheet, haenyeoSheet, seaTileUrl, seabedUrl, seaweedUrl, tewakSheet, waveTileUrl } from '../lib/pixelSea'
import { MOTION_EVENT, systemReducesMotion } from '../lib/motion'

// 내부 화면 뒤에 깔리는 움직이는 도트 배경 — 표현 전용. 클릭을 막지 않고 내용 뒤에만 보인다.
// 맨 위: 하늘(구름·새)과 바다(섬·돛단배·테왁). 아래로 스크롤할수록 바다 표면이 올라가며 바닷속(물고기·해녀·물방울·햇살)으로
// 잠수하고, 맨 아래에는 바다 밑바닥이 나타난다. 스크롤 값은 CSS 변수(--d 잠수, --p 깊이, --e 바닥)로만 전달해 리렌더링하지 않는다.
// 시스템의 "동작 줄이기"가 켜져 있고 사용자가 사이트에서 움직임을 켜지 않았다면 스크롤 연출도 하지 않는다.
const BIRD = ['x.....x', 'xx...xx', '.xxxxx.', '..xxx..']
const BIRD_DOWN = ['..xxx..', '.xxxxx.', 'xx...xx', 'x.....x']

function birdSprite() {
  const c = document.createElement('canvas'); c.width = 16; c.height = 4
  const ctx = c.getContext('2d'); ctx.fillStyle = '#1d4a45'
  ;[BIRD, BIRD_DOWN].forEach((frame, f) => frame.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') ctx.fillRect(f * 8 + x, y, 1, 1) })))
  return c.toDataURL()
}
function seeded(n) { let a = n; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296 } }

// 바닷속 생물: y = 잠수했을 때 화면 높이 %, dir = 헤엄치는 방향, dur = 가로지르는 초, delay = 시작 어긋남, s = 크기(--cs 배율에서 뺄 값)
const FISH = [
  { k: 'orange', y: 22, dir: 'r', dur: 48, delay: -10, s: 0 }, { k: 'yellow', y: 36, dir: 'l', dur: 40, delay: -22, s: 0 },
  { k: 'orange', y: 56, dir: 'r', dur: 62, delay: -5, s: 1 }, { k: 'blue', y: 30, dir: 'l', dur: 34, delay: -3, s: 1 },
  { k: 'blue', y: 33, dir: 'l', dur: 34, delay: -5, s: 1 }, { k: 'yellow', y: 72, dir: 'r', dur: 52, delay: -30, s: 0 }, { k: 'blue', y: 82, dir: 'l', dur: 70, delay: -14, s: 1 },
]

export default function PixelBackdrop() {
  const root = useRef(null)
  const cloudA = useRef(null), cloudB = useRef(null), islandBig = useRef(null), islandSmall = useRef(null), boat = useRef(null)

  useEffect(() => {
    drawClouds(cloudA.current, 7); drawClouds(cloudB.current, 19)
    drawIsland(islandBig.current, { cx: 36, hw: 34, H: 20, seed: 5 })
    drawIsland(islandSmall.current, { cx: 20, hw: 17, H: 11, seed: 9, crater: false })
    drawBoat(boat.current)
    const el = root.current, bird = `url(${birdSprite()})`
    const set = (sel, v) => el.querySelectorAll(sel).forEach((n) => { n.style.backgroundImage = v })
    set('.px-bird', bird)
    set('.px-sea-base', seaTileUrl()); set('.px-sea-waves', waveTileUrl(0)); set('.px-sea-waves2', waveTileUrl(1))
    set('.px-seabed-sand', seabedUrl()); set('.px-seabed-weed', seaweedUrl())
    const sheets = { orange: fishSheet('orange'), yellow: fishSheet('yellow'), blue: fishSheet('blue') }
    el.querySelectorAll('.px-fish').forEach((n) => { const s = sheets[n.dataset.kind]; n.style.backgroundImage = s.url; n.style.setProperty('--fw', s.fw); n.style.setProperty('--fh', s.fh); n.style.setProperty('--fn', s.n) })
    const h = haenyeoSheet(); const hn = el.querySelector('.px-haenyeo'); hn.style.backgroundImage = h.url; hn.style.setProperty('--fw', h.fw); hn.style.setProperty('--fh', h.fh); hn.style.setProperty('--fn', h.n)
    const t = tewakSheet(); const tn = el.querySelector('.px-tewak'); tn.style.backgroundImage = t.url; tn.style.setProperty('--fw', t.fw); tn.style.setProperty('--fh', t.fh)

    // 스크롤 → CSS 변수(--d 잠수 0~1, --p 깊이 0~1, --e 바닥 0~1). rAF 로 묶어 한 프레임에 한 번만 갱신한다.
    let raf = 0
    const update = () => {
      raf = 0
      const allowed = !systemReducesMotion() || document.documentElement.classList.contains('allow-motion')
      const H = innerHeight, max = Math.max(0, document.documentElement.scrollHeight - H), y = allowed ? scrollY : 0
      // 페이지 길이에 맞춰 연출 속도를 정한다: 어떤 페이지든 끝까지 내려가면 바다 밑바닥에 도착해야 한다.
      // 잠수는 (화면 높이의 80% | 페이지 스크롤 길이의 60%) 중 짧은 거리에 걸쳐 끝나고, 바닥은 그 뒤 남은 구간에서 올라온다.
      // 스크롤이 화면 높이의 25%도 안 되는 페이지는 움직임이 급해 보이므로 수면에 머문다.
      const active = allowed && max >= 0.25 * H
      const diveLen = Math.min(0.8 * H, 0.6 * max), bedLen = Math.min(0.6 * H, 0.4 * max)
      const d = active ? Math.min(1, y / diveLen) : 0
      const p = active ? Math.min(1, y / max) : 0
      const e = active ? Math.min(1, Math.max(0, (y - (max - bedLen)) / bedLen)) : 0
      el.style.setProperty('--d', d.toFixed(3)); el.style.setProperty('--p', p.toFixed(3)); el.style.setProperty('--e', e.toFixed(3))
      el.style.setProperty('--foot', `${Math.max(0, (document.querySelector('footer')?.offsetHeight ?? 50) - 6)}px`) // 푸터에 밑바닥이 가리지 않게
      document.documentElement.classList.toggle('px-deep', d > 0.55)
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    addEventListener('scroll', queue, { passive: true }); addEventListener('resize', queue); addEventListener(MOTION_EVENT, update)
    const ro = new ResizeObserver(queue); ro.observe(document.body)
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', queue); removeEventListener('resize', queue); removeEventListener(MOTION_EVENT, update); ro.disconnect(); document.documentElement.classList.remove('px-deep') }
  }, [])

  const sparkles = useMemo(() => { const r = seeded(11); return Array.from({ length: 16 }, () => ({ x: r() * 100, y: r() * 60, d: r() * 4 })) }, [])
  const bubbles = useMemo(() => { const r = seeded(23); return Array.from({ length: 16 }, () => ({ x: r() * 100, s: 1 + Math.floor(r() * 2), dur: 9 + r() * 9, d: -r() * 16 })) }, [])

  return (
    <div className="pixel-backdrop" aria-hidden="true" ref={root}>
      <div className="px-skygroup">
        <div className="px-layer px-clouds-far"><canvas ref={cloudB} width={640} height={80} /></div>
        <div className="px-layer px-clouds-near"><canvas ref={cloudA} width={640} height={80} /></div>
        {sparkles.map((s, i) => <span key={i} className="px-sparkle" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />)}
        {[0, 1, 2].map((i) => <span key={i} className={`px-bird px-bird-${i}`} />)}
      </div>

      {/* 바다 표면 묶음: 스크롤하면 통째로 위로 올라가고, 그 아래(바닷속)가 드러난다 */}
      <div className="px-surface">
        <div className="px-deep" />
        {FISH.map((f, i) => <span key={i} className={`px-fish px-fish-${f.dir}`} data-kind={f.k} style={{ '--y': f.y, '--dur': `${f.dur}s`, '--delay': `${f.delay}s`, '--sz': f.s }} />)}
        <span className="px-haenyeo" />
        <div className="px-sea px-sea-base" />
        <div className="px-sea px-sea-waves" />
        <canvas ref={islandSmall} className="px-island px-island-small" width={40} height={28} />
        <canvas ref={islandBig} className="px-island px-island-big" width={72} height={32} />
        <span className="px-tewak" />
        <canvas ref={boat} className="px-boat" width={14} height={8} />
        <div className="px-sea px-sea-waves2" /> {/* 앞쪽 물결: 섬 밑동·배 앞을 지나간다 */}
      </div>

      <div className="px-rays" />
      <div className="px-dark" />
      {bubbles.map((b, i) => <span key={i} className={`px-bubble px-bubble-${b.s}`} style={{ left: `${b.x}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.d}s` }} />)}
      <div className="px-seabed"><div className="px-seabed-layer px-seabed-sand" /><div className="px-seabed-layer px-seabed-weed" /></div>
    </div>
  )
}
