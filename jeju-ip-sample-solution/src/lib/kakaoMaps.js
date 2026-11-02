let pending
// 두 지도에서 동일 SDK를 공유한다. 키나 원본 네트워크 오류를 출력하지 않는다.
export function loadKakaoMaps(key) {
  if (!key) return Promise.reject(new Error('MAP_KEY_MISSING'))
  if (pending) return pending
  pending = new Promise((resolve, reject) => {
    let settled = false
    const finish = (error, maps) => {
      if (settled) return
      settled = true; clearTimeout(timer)
      if (error) reject(new Error('MAP_UNAVAILABLE')); else resolve(maps)
    }
    const timer = setTimeout(() => finish(true), 10000)
    const ready = () => {
      try {
        if (!window.kakao?.maps?.load) return finish(true)
        window.kakao.maps.load(() => {
          const maps = window.kakao?.maps
          finish(!maps?.Map || !maps?.Marker, maps)
        })
      } catch { finish(true) }
    }
    if (window.kakao?.maps) return ready()
    let script = document.getElementById('kakao-map-sdk-script')
    if (script?.dataset.failed === 'true') return finish(true)
    if (!script) {
      script = document.createElement('script'); script.id = 'kakao-map-sdk-script'
      script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?' + new URLSearchParams({ appkey: key, autoload: 'false' })
      script.async = true
      script.addEventListener('load', ready, { once: true })
      script.addEventListener('error', () => { script.dataset.failed = 'true'; finish(true) }, { once: true })
      document.head.appendChild(script)
    } else {
      script.addEventListener('load', ready, { once: true })
      script.addEventListener('error', () => finish(true), { once: true })
    }
  })
  return pending
}
export const kakaoBrowserKey = () => import.meta.env.VITE_KAKAO_MAP_KEY || import.meta.env.VITE_KAKAO_JS_KEY || import.meta.env.VITE_KAKAO_APP_KEY || ''
