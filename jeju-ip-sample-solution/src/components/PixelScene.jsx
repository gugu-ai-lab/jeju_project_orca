import { useEffect, useRef } from 'react'
import { SCENE_H, SCENE_W, drawClouds, drawSailboat, drawScene } from '../lib/pixelScene'

// 제주 픽셀 풍경 — 그림만 담당한다(글자·버튼은 쓰지 않음). 나중에 다른 그림으로 바꿔도 Landing 은 그대로.
export default function PixelScene() {
  const sceneRef = useRef(null)
  const cloudRef = useRef(null)
  const boatRef = useRef(null)

  useEffect(() => {
    drawScene(sceneRef.current)
    drawClouds(cloudRef.current)
    drawSailboat(boatRef.current)
  }, [])

  return (
    <div className="pixel-scene" aria-hidden="true">
      <canvas ref={sceneRef} className="pixel-canvas" width={SCENE_W} height={SCENE_H} />
      <canvas ref={boatRef} className="pixel-landing-boat" width={14} height={8} />
      <div className="pixel-clouds">
        <canvas ref={cloudRef} width={SCENE_W * 2} height={80} />
      </div>
    </div>
  )
}
