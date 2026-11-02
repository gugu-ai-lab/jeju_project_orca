import { useEffect, useRef, useState } from 'react'
import { kakaoBrowserKey, loadKakaoMaps } from '../lib/kakaoMaps'
import { readVerifiedCoordinates } from '../lib/coordinates'

export default function VerifiedLocationMap({ title, latitude, longitude, source }) {
  const container = useRef(null)
  const [status, setStatus] = useState('loading')
  const coords = readVerifiedCoordinates(latitude, longitude)
  const lat = coords?.lat ?? null
  const lng = coords?.lng ?? null

  useEffect(() => {
    if (lat == null || lng == null) return undefined
    let active = true, marker
    loadKakaoMaps(kakaoBrowserKey()).then(maps => {
      if (!active || !container.current) return
      try {
        const position = new maps.LatLng(lat, lng)
        const map = new maps.Map(container.current, { center: position, level: 4 })
        marker = new maps.Marker({ position, title }); marker.setMap(map)
        setStatus('ready')
      } catch { setStatus('error') }
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false; marker?.setMap(null) }
  }, [lat, lng, title])

  if (!coords) return <p className="small text-secondary mb-0">확인된 좌표가 없어 지도와 길찾기를 제공하지 않아요.</p>
  return <section className="record-location-map" aria-label={`${title} 위치 지도`}>
    <p className="small text-secondary mb-1">위치 출처: {source}</p>
    <div ref={container} className="record-kakao-map rounded" role="img" aria-label={`${title} 위치 지도`}
      data-map-status={status} data-latitude={coords.lat} data-longitude={coords.lng} />
    {status === 'loading' && <p className="small text-secondary" role="status">지도를 불러오고 있어요.</p>}
    {status === 'error' && <p className="small text-secondary" role="status">지도를 불러오지 못했어요. 주소와 좌표는 확인할 수 있어요.</p>}
  </section>
}
