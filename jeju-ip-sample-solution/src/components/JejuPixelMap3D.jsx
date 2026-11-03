import { useEffect, useRef, useState } from 'react'
import { buildJejuMapData, createJejuMapRenderer, pinWorld } from '../lib/jejuPixelMap'
import { systemReducesMotion } from '../lib/motion'

// three.js(package.json 의 three)는 지도 화면을 열 때 한 번만 따로 내려받는다(코드 분할).
const loadThree = () => import('three').catch(() => null)

let cachedData = null
const getData = () => (cachedData ||= buildJejuMapData())

const FLAT_TILT = Math.PI / 2 * 0.9999
const TILT_3D = 38 * Math.PI / 180
const ROTATE_SPEED = 0.3 // 자동 회전 속도(rad/초, 약 21초에 한 바퀴)
const MIN_GAP_X = 34 // 이보다 가까운 핀은 화면에서 좌우로 벌린다(px)
const MIN_GAP_Y = 26

/**
 * JejuPixelMap3D — three.js 로 그린 도트 제주 지도 + 클릭 가능한 신화 장소 핀.
 * 핀은 realGeoCoords(실제 위경도)를 지도 칸 좌표로 바꿔 놓고, 매 프레임 화면 좌표로 다시 투영해
 * 돌리거나 기울이거나 2D 로 바꿔도 같은 장소 위에 붙어 있다.
 */
export default function JejuPixelMap3D({ pins, selectedPinId, bouncingPinId, onPinClick, onBounceEnd }) {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const pinEls = useRef({})
  const pinsRef = useRef(pins)
  const view = useRef({ tilt: TILT_3D, yaw: 0, hScale: 14, px: 2, reduce: false, auto: true, flat: false })
  const rendererRef = useRef(null)
  const dragRef = useRef(null)
  const [flat, setFlat] = useState(false)
  const [auto, setAuto] = useState(true)
  const [engine, setEngine] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => { pinsRef.current = pins }, [pins])

  useEffect(() => {
    let cancelled = false
    let raf = 0
    let ro = null
    const stage = stageRef.current
    const canvas = canvasRef.current
    const data = getData()
    const getSize = () => [stage.clientWidth || 1, stage.clientHeight || 1]
    const getView = () => view.current

    loadThree().then((THREE) => {
      if (cancelled) return
      if (!THREE) setLoadFailed(true)
      const r = createJejuMapRenderer(THREE, { canvas, data, getSize, getView })
      rendererRef.current = r
      setEngine(r.name)
      r.resize()
      ro = new ResizeObserver(() => r.resize())
      ro.observe(stage)

      // '동작 줄이기'가 켜져 있으면 처음엔 멈춘 채로 시작한다. 그래도 사용자가 직접 누른 "회전 시작"은 그대로 동작한다.
      const reducedAtStart = systemReducesMotion() && !document.documentElement.classList.contains('allow-motion')
      if (reducedAtStart) { view.current.auto = false; setAuto(false) }
      let prev = 0
      const loop = (t) => {
        const v = view.current
        const dt = prev ? Math.min(0.1, (t - prev) / 1000) : 0
        prev = t
        v.reduce = systemReducesMotion() && !document.documentElement.classList.contains('allow-motion')
        if (v.auto && !v.flat) v.yaw += dt * ROTATE_SPEED
        v.tilt = v.flat ? FLAT_TILT : TILT_3D
        r.frame(t)
        // 실제 위치를 화면 좌표로 투영한 뒤, 서로 너무 가까운 핀은 말풍선만 옆으로 살짝 벌려 겹침을 피한다
        const placed = []
        for (const pin of pinsRef.current) {
          const g = pin.realGeoCoords
          if (!g || !pinEls.current[pin.pinId]) continue
          const w = pinWorld(data, g.lng, g.lat, v.hScale)
          const [x, y] = r.pin(w.x, w.y, w.z)
          placed.push({ id: pin.pinId, x, y })
        }
        placed.sort((a, b) => a.x - b.x)
        for (let a = 0; a < placed.length; a++) {
          for (let b = a + 1; b < placed.length; b++) {
            const dx = placed[b].x - placed[a].x, dy = Math.abs(placed[b].y - placed[a].y)
            if (dx < MIN_GAP_X && dy < MIN_GAP_Y) {
              const push = (MIN_GAP_X - dx) / 2
              placed[a].x -= push; placed[b].x += push
            }
          }
        }
        for (const q of placed) {
          const el = pinEls.current[q.id]
          el.style.left = `${q.x}px`
          el.style.top = `${q.y}px`
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ro?.disconnect()
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
  }, [])

  function toggleFlat() {
    const next = !view.current.flat
    view.current.flat = next
    if (next) { view.current.yaw = 0; view.current.auto = false; setAuto(false) }
    setFlat(next)
  }
  function toggleAuto() {
    const next = !view.current.auto
    view.current.auto = next
    setAuto(next)
  }
  function onPointerDown(e) {
    if (e.target.closest('button')) return // 핀·버튼 클릭은 회전으로 가로채지 않는다
    dragRef.current = { x: e.clientX, yaw: view.current.yaw }
    e.currentTarget.setPointerCapture(e.pointerId)
    view.current.auto = false
    setAuto(false)
  }
  function onPointerMove(e) {
    if (dragRef.current && !view.current.flat) view.current.yaw = dragRef.current.yaw - (e.clientX - dragRef.current.x) * 0.006
  }

  return (
    <div
      ref={stageRef}
      className="map3d-stage"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => { dragRef.current = null }}
      onPointerCancel={() => { dragRef.current = null }}
    >
      <canvas
        ref={canvasRef}
        className="map3d-canvas"
        role="img"
        aria-label="한라산 백록담과 곶자왈 숲, 유채 들판, 감귤 과수원이 있는 도트 아트 제주도 지도. 신화 장소 핀이 놓여 있어요."
      />

      <div className="pastel-map-pins-layer">
        {pins.map((pin) => {
          const isSelected = selectedPinId === pin.pinId
          const isBouncing = bouncingPinId === pin.pinId
          return (
            <button
              key={pin.pinId}
              ref={(el) => { pinEls.current[pin.pinId] = el }}
              type="button"
              className={['jeju-map-pin', `tone-${pin.pinTone || 'sky'}`, isSelected ? 'is-selected' : '', isBouncing ? 'is-bouncing' : ''].filter(Boolean).join(' ')}
              style={{ left: '-99px', top: '-99px' }}
              onClick={() => onPinClick(pin)}
              onAnimationEnd={onBounceEnd}
              aria-pressed={isSelected}
              title={`${pin.mythTitle} · ${pin.placeName}`}
              aria-label={`${pin.placeName} (${pin.mythTitle}) 신화 선택`}
            >
              {isSelected && <span className="pin-pulse-ring" aria-hidden="true" />}
              <span className="pin-ground-shadow" aria-hidden="true" />
              <span className="pin-marker-bubble">
                <span className="pin-emoji" aria-hidden="true">{pin.emoji}</span>
                <span className="pin-myth-name">{pin.mythTitle}</span>
              </span>
              <span className="pin-place-sub">{pin.placeName}</span>
              <span className="pin-tail" aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <div className="map3d-controls">
        <button type="button" className="map3d-btn" onClick={toggleFlat} aria-pressed={flat}>
          {flat ? '3D로 보기' : '2D로 보기'}
        </button>
        <button type="button" className="map3d-btn" onClick={toggleAuto} disabled={flat} aria-pressed={auto}>
          {auto ? '회전 멈춤' : '회전 시작'}
        </button>
      </div>
      <span className="map3d-engine" role="status">
        {loadFailed ? '2D 캔버스(three.js 불러오기 실패)' : engine}
      </span>
    </div>
  )
}
