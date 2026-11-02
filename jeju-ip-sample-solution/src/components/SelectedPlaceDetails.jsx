import { useEffect, useRef, useState } from 'react'
import { kakaoBrowserKey, loadKakaoMaps } from '../lib/kakaoMaps'

function shortTime(date, time) {
  return `${Number(date.slice(4, 6))}월 ${Number(date.slice(6, 8))}일 ${time.slice(0, 2)}:${time.slice(2, 4)}`
}
function PlaceMap({ pin }) {
  const container = useRef(null)
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    let active = true, marker
    loadKakaoMaps(kakaoBrowserKey()).then(maps => {
      if (!active || !container.current) return
      try {
        const position = new maps.LatLng(pin.realGeoCoords.lat, pin.realGeoCoords.lng)
        const map = new maps.Map(container.current, { center: position, level: 4 })
        marker = new maps.Marker({ position, title: pin.location.name }); marker.setMap(map)
        setStatus('ready')
      } catch { setStatus('error') }
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false; marker?.setMap(null) }
  }, [pin])
  return <div className="my-2">
    <div ref={container} className="selected-place-map rounded" role="img" aria-label={`${pin.location.name} 실제 위치 지도`}
      data-map-status={status} data-latitude={pin.realGeoCoords.lat} data-longitude={pin.realGeoCoords.lng}
      style={{ height: 180, display: status === 'error' ? 'none' : 'block' }} />
    {status === 'loading' && <p className="small text-secondary" role="status">실제 위치 지도를 불러오는 중이에요.</p>}
    {status === 'error' && <p className="small text-secondary" role="status">지도를 불러오지 못했어요. 아래 길찾기에서 위치를 확인해 주세요.</p>}
  </div>
}
export default function SelectedPlaceDetails({ pin }) {
  const [weather, setWeather] = useState(null)
  const [state, setState] = useState('loading')
  const hasLocation = Boolean(pin?.hasVerifiedLocation && pin.realGeoCoords && pin.location?.address)
  useEffect(() => {
    if (!hasLocation) return
    const controller = new AbortController()
    fetch('/api/weather?' + new URLSearchParams({ mythId: pin.mythId }), { signal: controller.signal })
      .then(async response => {
        const data = await response.json()
        if (!response.ok || data.mythId !== pin.mythId || data.kind !== 'forecast' || !data.items?.length) throw new Error('WEATHER_UNAVAILABLE')
        if (!controller.signal.aborted) { setWeather(data); setState('ready') }
      }).catch(() => { if (!controller.signal.aborted) setState('error') })
    return () => controller.abort()
  }, [hasLocation, pin])
  if (!hasLocation) return <p className="small text-secondary">한 곳으로 정해진 장소가 없어 지도·예보·길찾기를 표시하지 않아요.</p>
  return <section className="selected-place-details mb-3" aria-label="선택한 장소의 위치와 예보" data-place-id={pin.mythId}>
    <p className="small mb-1">{pin.location.address}</p>
    <p className="small text-secondary mb-1">위도 {pin.realGeoCoords.lat.toFixed(6)} · 경도 {pin.realGeoCoords.lng.toFixed(6)}
      {' · '}<a href={pin.location.sourceUrl} target="_blank" rel="noopener noreferrer">위치 출처</a></p>
    <PlaceMap pin={pin} />
    <div className="rounded p-2" style={{ background: '#EDF6F6' }} aria-live="polite">
      <strong className="small">☁️ 이곳 주변의 단기예보</strong>
      {state === 'loading' && <p className="small mb-0" role="status">예보를 불러오는 중이에요.</p>}
      {state === 'error' && <p className="small mb-0" role="status">예보를 불러오지 못했어요. 이야기와 퀴즈는 계속 즐길 수 있어요.</p>}
      {state === 'ready' && weather && <>
        <p className="small text-secondary mb-1">기상청 · {shortTime(weather.baseDate, weather.baseTime)} 발표 (한국 시각)</p>
        <ul className="small ps-3 mb-1">{weather.items.slice(0, 3).map(item => {
          const [date, time] = item.time.split(' ')
          return <li key={item.id}>{shortTime(date, time)} 예보 · {item.sky || '하늘 정보 없음'} · {item.temp ?? '—'}°C · 비 올 확률 {item.pop ?? '—'}%</li>
        })}</ul>
        <p className="small text-secondary mb-0">현재 관측값이 아닌 주변 지역의 예보예요.</p>
      </>}
    </div>
  </section>
}
