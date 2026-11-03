import { useEffect, useRef } from 'react'
import { SCENE_H, SCENE_W, drawClouds, drawHaenyeo, drawScene } from '../lib/pixelScene'

// 제주 픽셀 풍경 — 그림만 담당한다(글자·버튼은 쓰지 않음). 나중에 다른 그림으로 바꿔도 Landing 은 그대로.
export default function PixelScene() {
  const sceneRef = useRef(null)
  const cloudRef = useRef(null)
  const haenyeoRef = useRef(null)

  useEffect(() => {
    drawScene(sceneRef.current)
    drawClouds(cloudRef.current)
    let wave = false
    const draw = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const enabled = document.documentElement.classList.contains('allow-motion')
      if (!reduced || enabled) wave = !wave
      drawHaenyeo(haenyeoRef.current, wave)
    }
    draw()
    const waveTimer = window.setInterval(draw, 420)
    return () => window.clearInterval(waveTimer)
  }, [])

  return (
    <div className="pixel-scene" aria-hidden="true">
      <canvas ref={sceneRef} className="pixel-canvas" width={SCENE_W} height={SCENE_H} />
      <canvas ref={haenyeoRef} className="pixel-landing-haenyeo" width={20} height={18} />
      <div className="pixel-clouds">
        <canvas ref={cloudRef} width={SCENE_W * 2} height={80} />
      </div>
    </div>
  )
}
