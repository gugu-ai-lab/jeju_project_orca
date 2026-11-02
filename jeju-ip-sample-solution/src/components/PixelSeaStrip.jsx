import { useEffect, useRef } from 'react'
import { drawBoat, drawIsland, seaTileUrl, waveTileUrl } from '../lib/pixelSea'

// 페이지 끝(푸터 위)의 바다 풍경 띠 — 큰 섬(분화구)·작은 섬·돛단배. 표현 전용, 클릭을 막지 않는다.
export default function PixelSeaStrip() {
  const root = useRef(null)
  const big = useRef(null)
  const small = useRef(null)
  const boat = useRef(null)
  useEffect(() => {
    drawIsland(big.current, { cx: 36, hw: 34, H: 20, seed: 5 })
    drawIsland(small.current, { cx: 20, hw: 17, H: 11, seed: 9, crater: false })
    drawBoat(boat.current)
    root.current.querySelector('.px-sea-base').style.backgroundImage = seaTileUrl()
    root.current.querySelector('.px-sea-waves').style.backgroundImage = waveTileUrl(0)
    root.current.querySelector('.px-sea-waves2').style.backgroundImage = waveTileUrl(1)
  }, [])
  return (
    <div className="px-seastrip" aria-hidden="true" ref={root}>
      <div className="px-sea px-sea-base" />
      <div className="px-sea px-sea-waves" />
      <canvas ref={small} className="px-island px-island-small" width={40} height={28} />
      <canvas ref={big} className="px-island px-island-big" width={72} height={32} />
      <canvas ref={boat} className="px-boat" width={14} height={8} />
      <div className="px-sea px-sea-waves2" /> {/* 앞쪽 물결: 섬 밑동·배 앞을 지나간다 */}
    </div>
  )
}
