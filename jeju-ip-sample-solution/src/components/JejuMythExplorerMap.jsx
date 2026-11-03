import { useState } from 'react'
import mapPinsData from '../data/jejuMapPins.json'
import { PIXEL_MAP_COORDS } from '../data/pixelMapCoords'
import JejuPixelMap3D from './JejuPixelMap3D'
const verifiedPins = mapPinsData.filter(p => p.hasVerifiedLocation && PIXEL_MAP_COORDS[p.pinId])
// 도트 3D 지도의 핀은 실제 위경도(realGeoCoords)로 놓는다
const geoPins = verifiedPins.filter(p => p.realGeoCoords)

/**
 * JejuMythExplorerMap — 도트 제주 신화 탐험 지도 + 카카오맵 연동
 */
export default function JejuMythExplorerMap({
  selectedMythId,
  onSelectMyth,
}) {
  const [bouncingPinId, setBouncingPinId] = useState(null)
  const [focusOnly, setFocusOnly] = useState(false)
  const selectedPin = mapPinsData.find(p => p.mythId === selectedMythId) || verifiedPins[0]
  const isGlobalMythSelected = selectedPin && !selectedPin.hasVerifiedLocation
  const visibleGeoPins = focusOnly ? geoPins.filter(pin => pin.mythId === selectedMythId) : geoPins
  function handlePinClick(pin) {
    setBouncingPinId(pin.pinId)
    onSelectMyth?.(pin.mythId)
  }

  // 카카오맵 외부 길찾기 URL 생성 (실제 좌표 기준)
  const kakaoDirectionsUrl = selectedPin?.realGeoCoords
    ? `https://map.kakao.com/link/to/${encodeURIComponent(selectedPin.realGeoCoords.kakaoPlaceName || selectedPin.placeName)},${selectedPin.realGeoCoords.lat},${selectedPin.realGeoCoords.lng}`
    : null

  return (
    <div className="explorer-map-card">
      {/* 지도 상단 안내와 길찾기 */}
      <div className="explorer-map-topbar">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="map-badge-pill">
            🗺️ 신화 탐험 핀 <strong>{verifiedPins.length}곳</strong>
          </span>
          <span className="map-hint-text">
            {focusOnly ? `${selectedPin.mythTitle}의 장소만 보고 있어요` : '아래 장소를 누르면 해당 핀만 보여요'}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {kakaoDirectionsUrl && (
            <a
              href={kakaoDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kakao-route"
              title="카카오맵에서 실제 위치와 길 찾기 열기"
            >
              <i className="bi bi-sign-turn-right me-1" />
              실제 위치·길찾기
            </a>
          )}
        </div>
      </div>

      {/* 메인 지도 스테이지 */}
      <div className="explorer-map-stage">
          <div className="pastel-jeju-map-wrap is-popup-25d">
            {/* 단일 고정 위치가 없는 신화(자청비) 선택 시 안내 배너 */}
            {isGlobalMythSelected && (
              <div className="map-global-myth-banner" role="status">
                <span className="fs-4" aria-hidden="true">🌾</span>
                <div>
                  <strong>‘{selectedPin.mythTitle}’는 제주 섬 전체 마을에 전해지는 신화예요!</strong>
                  <p className="mb-0">
                    특정한 한 곳의 유적지가 아니라 제주 전역에서 풍년을 기원하며 부르던 농경 본풀이여서 가짜 핀을 찍지 않았어요.
                  </p>
                </div>
              </div>
            )}

            <JejuPixelMap3D
              pins={visibleGeoPins}
              selectedPinId={selectedPin?.pinId}
              bouncingPinId={bouncingPinId}
              onPinClick={handlePinClick}
              onBounceEnd={() => setBouncingPinId(null)}
            />
          </div>

      </div>

      {/* 지도 하단 JSON 핀 빠른 선택 칩 바 */}
      <div className="explorer-map-chips" aria-label="신화 장소 빠른 선택">
        <button type="button" className={`map-place-chip map-place-all ${!focusOnly ? 'is-active' : ''}`}
          aria-pressed={!focusOnly} onClick={() => setFocusOnly(false)}>🗺️ 전체 장소 보기</button>
        {verifiedPins.map((pin) => {
          const active = focusOnly && selectedPin?.pinId === pin.pinId
          return (
            <button
              key={pin.pinId}
              type="button"
              className={`map-place-chip ${active ? 'is-active' : ''}`}
              aria-pressed={active}
              onClick={() => { setFocusOnly(true); handlePinClick(pin) }}
            >
              <span>{pin.emoji}</span>
              <span>{pin.buttonLabel || pin.mythTitle}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
