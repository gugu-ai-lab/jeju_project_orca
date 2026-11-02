import { useState } from 'react'
import mapPinsData from '../data/jejuMapPins.json'
import { PIXEL_MAP, PIXEL_MAP_COORDS } from '../data/pixelMapCoords'
const verifiedPins = mapPinsData.filter(p => p.hasVerifiedLocation && PIXEL_MAP_COORDS[p.pinId])

/**
 * JejuMythExplorerMap — 픽셀 아트 제주 신화 탐험 지도(기본) + 카카오맵 연동
 *
 * 배경 그림과 핀은 같은 16:9 영역(.pastel-jeju-map-wrap)에 놓이고, 핀 위치는 %(pixelMapCoords.js)라서
 * 화면 크기가 바뀌어도 어긋나지 않는다.
 *
 * 참고:
 * - Three.js 기반 미니어처 컴포넌트(`src/components/JejuMiniature3D.jsx`)는 추후 재검토를 위해 파일로 보존하되,
 *   현재 화면과 지도 모드 선택 탭에서는 제외하여 밝고 깔끔한 SVG 일러스트 지도에 집중한다.
 */
export default function JejuMythExplorerMap({
  selectedMythId,
  onSelectMyth,
}) {
  const [bouncingPinId, setBouncingPinId] = useState(null)
  const [focusOnly, setFocusOnly] = useState(false)
  const selectedPin = mapPinsData.find(p => p.mythId === selectedMythId) || verifiedPins[0]
  const isGlobalMythSelected = selectedPin && !selectedPin.hasVerifiedLocation
  const visiblePins = focusOnly ? verifiedPins.filter(pin => pin.mythId === selectedMythId) : verifiedPins
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
      {/* 지도 상단 컨트롤 바 (3D 미니어처 탭 숨김 처리) */}
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
          <span className="map-badge-pill">🎨 그림책지도</span>
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

            {/* 픽셀 아트 제주 지도 배경 — 장소명·핀이 없는 그림이므로 아래 핀 레이어를 겹쳐 사용 */}
            <img
              src={PIXEL_MAP.src}
              width={PIXEL_MAP.width}
              height={PIXEL_MAP.height}
              className="pixel-map-bg"
              alt="한라산 백록담과 오름, 유채꽃밭, 돌담 마을이 있는 제주도를 위에서 본 픽셀 아트 지도"
              draggable="false"
            />

            {/* 6. JSON 기반 클릭 가능한 스탠드형 신화 장소 핀 오버레이 */}
            <div className="pastel-map-pins-layer">
              {visiblePins.map((pin) => {
                const isSelected = selectedPin?.pinId === pin.pinId
                const isBouncing = bouncingPinId === pin.pinId
                return (
                  <button
                    key={pin.pinId}
                    type="button"
                    className={[
                      'jeju-map-pin',
                      `tone-${pin.pinTone || 'sky'}`,
                      isSelected ? 'is-selected' : '',
                      isBouncing ? 'is-bouncing' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{
                      left: `${PIXEL_MAP_COORDS[pin.pinId].x}%`,
                      top: `${PIXEL_MAP_COORDS[pin.pinId].y}%`,
                    }}
                    onClick={() => handlePinClick(pin)}
                    onAnimationEnd={() => setBouncingPinId(null)}
                    aria-pressed={isSelected}
                    title={`${pin.mythTitle} · ${pin.placeName}`}
                    aria-label={`${pin.placeName} (${pin.mythTitle}) 신화 선택`}
                  >
                    {isSelected && <span className="pin-pulse-ring" aria-hidden="true" />}
                    <span className="pin-ground-shadow" aria-hidden="true" />
                    <span className="pin-marker-bubble">
                      <span className="pin-emoji" aria-hidden="true">
                        {pin.emoji}
                      </span>
                      <span className="pin-myth-name">{pin.mythTitle}</span>
                    </span>
                    <span className="pin-place-sub">{pin.placeName}</span>
                    <span className="pin-tail" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
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
