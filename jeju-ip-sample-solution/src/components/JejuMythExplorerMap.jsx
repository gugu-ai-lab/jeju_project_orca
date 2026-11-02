import { useEffect, useRef, useState } from 'react'

/**
 * JejuMythExplorerMap — 제주 신화 탐험 지도 컴포넌트
 *
 * 특징:
 * 1. VITE_KAKAO_MAP_KEY(또는 VITE_KAKAO_JS_KEY)가 설정된 환경에서는 Kakao Maps SDK를 동적 로드하여
 *    실제 지도 위에 검증된 신화 장소 마커를 표시하고, '파스텔 탐험 지도 ↔ 카카오맵' 전환을 지원한다.
 * 2. API 키가 없거나 도메인/네트워크 제한으로 SDK가 로드되지 않는 환경에서는
 *    실제 제주 해안선과 방위(제주시·조천·성산·안덕·한경)에 맞춰 설계된 인터랙티브 파스텔 제주 탐험 지도를
 *    기본 화면으로 제공하며, 하단에 명확한 안내 문구를 표시한다.
 * 3. 지도 핀은 Gemini 콘텐츠 검증 문서에서 실제 좌표와 출처가 확인된 6개 장소만 표시한다.
 *    단일 고정 유적지가 없는 '자청비'는 임의의 가짜 핀을 찍지 않고 '제주 전역 전승 신화' 안내 배너로 표시한다.
 */
export default function JejuMythExplorerMap({
  myths = [],
  selectedMyth,
  onSelectMyth,
}) {
  const kakaoKey =
    import.meta.env.VITE_KAKAO_MAP_KEY ||
    import.meta.env.VITE_KAKAO_JS_KEY ||
    import.meta.env.VITE_KAKAO_APP_KEY ||
    ''

  const [mapMode, setMapMode] = useState('pastel') // 'pastel' | 'kakao'
  const [kakaoStatus, setKakaoStatus] = useState(kakaoKey ? 'idle' : 'no-key') // 'no-key' | 'idle' | 'loading' | 'ready' | 'error'
  const mapContainerRef = useRef(null)
  const kakaoMapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const latestPropsRef = useRef({ selectedMyth, onSelectMyth, myths })
  latestPropsRef.current = { selectedMyth, onSelectMyth, myths }

  // 지도 위치(좌표)가 검증된 신화 장소만 필터링
  const mapPinnedMyths = myths.filter((m) => m.mapPin && m.mapPin.hasLocation !== false)
  const isGlobalMythSelected = selectedMyth && (!selectedMyth.mapPin || selectedMyth.mapPin.hasLocation === false)

  function handleSelectMode(nextMode) {
    setMapMode(nextMode)
    if (nextMode === 'kakao') {
      if (!kakaoKey) {
        setKakaoStatus('no-key')
      } else if (kakaoStatus === 'idle') {
        setKakaoStatus('loading')
      }
    }
  }

  // 카카오맵 SDK 로드 및 마커 렌더링
  useEffect(() => {
    if (mapMode !== 'kakao' || !kakaoKey) return

    let cancelled = false

    function initKakaoMap() {
      if (cancelled || !mapContainerRef.current) return
      if (!window.kakao || !window.kakao.maps) {
        setKakaoStatus('error')
        return
      }

      window.kakao.maps.load(() => {
        if (cancelled || !mapContainerRef.current) return
        try {
          const { selectedMyth: curSelected, onSelectMyth: curOnSelect, myths: curMyths } =
            latestPropsRef.current
          const pinned = curMyths.filter((m) => m.mapPin && m.mapPin.hasLocation !== false)
          const centerLat = curSelected?.mapPin?.lat || 33.3846
          const centerLng = curSelected?.mapPin?.lng || 126.5535
          const options = {
            center: new window.kakao.maps.LatLng(centerLat, centerLng),
            level: 10,
          }
          const map = new window.kakao.maps.Map(mapContainerRef.current, options)
          kakaoMapInstanceRef.current = map

          // 기존 마커 정리
          markersRef.current.forEach((m) => m.setMap(null))
          markersRef.current = []

          pinned.forEach((myth) => {
            const pos = new window.kakao.maps.LatLng(myth.mapPin.lat, myth.mapPin.lng)
            const marker = new window.kakao.maps.Marker({
              position: pos,
              title: `${myth.title} · ${myth.mapPin.shortPlace}`,
            })
            marker.setMap(map)
            window.kakao.maps.event.addListener(marker, 'click', () => {
              curOnSelect?.(myth.id)
            })
            markersRef.current.push(marker)
          })

          setKakaoStatus('ready')
        } catch {
          setKakaoStatus('error')
        }
      })
    }

    if (window.kakao && window.kakao.maps) {
      initKakaoMap()
    } else {
      const existingScript = document.getElementById('kakao-map-sdk-script')
      if (existingScript) {
        existingScript.addEventListener('load', initKakaoMap)
        existingScript.addEventListener('error', () => !cancelled && setKakaoStatus('error'))
      } else {
        const script = document.createElement('script')
        script.id = 'kakao-map-sdk-script'
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(kakaoKey)}&autoload=false`
        script.async = true
        script.onload = initKakaoMap
        script.onerror = () => !cancelled && setKakaoStatus('error')
        document.head.appendChild(script)
      }
    }

    return () => {
      cancelled = true
    }
  }, [mapMode, kakaoKey])

  // 선택한 신화가 바뀌면 카카오맵 중심 이동
  useEffect(() => {
    if (
      mapMode === 'kakao' &&
      kakaoStatus === 'ready' &&
      kakaoMapInstanceRef.current &&
      window.kakao?.maps &&
      selectedMyth?.mapPin?.lat
    ) {
      const moveLatLon = new window.kakao.maps.LatLng(
        selectedMyth.mapPin.lat,
        selectedMyth.mapPin.lng
      )
      kakaoMapInstanceRef.current.panTo(moveLatLon)
    }
  }, [selectedMyth, mapMode, kakaoStatus])

  return (
    <div className="explorer-map-card">
      {/* 지도 상단 컨트롤 바 */}
      <div className="explorer-map-topbar">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="map-badge-pill">
            🗺️ 검증된 신화 장소 <strong>{mapPinnedMyths.length}곳</strong>
          </span>
          <span className="map-hint-text">
            핀을 클릭해 숨겨진 신화를 열어 보세요!
          </span>
        </div>

        <div className="map-mode-switch" role="group" aria-label="지도 표시 방식 선택">
          <button
            type="button"
            className={`map-mode-btn ${mapMode === 'pastel' ? 'is-active' : ''}`}
            onClick={() => handleSelectMode('pastel')}
          >
            🎨 탐험 일러스트 지도
          </button>
          <button
            type="button"
            className={`map-mode-btn ${mapMode === 'kakao' ? 'is-active' : ''}`}
            onClick={() => handleSelectMode('kakao')}
          >
            📍 카카오맵 보기
          </button>
        </div>
      </div>

      {/* 메인 지도 스테이지 */}
      <div className="explorer-map-stage">
        {mapMode === 'kakao' && kakaoStatus === 'ready' ? (
          <div
            ref={mapContainerRef}
            className="kakao-map-canvas"
            aria-label="카카오맵 제주 신화 장소 지도"
          />
        ) : (
          <div className="pastel-jeju-map-wrap">
            {/* 카카오맵 모드를 눌렀으나 API 키가 없거나 로드 실패한 경우 상단 안내 배너 표시 후 대체 지도 유지 */}
            {mapMode === 'kakao' && kakaoStatus === 'no-key' && (
              <div className="map-fallback-notice" role="status">
                <strong>💡 카카오맵 API 키 미설정 안내</strong>
                <span>
                  현재 환경에 <code>VITE_KAKAO_MAP_KEY</code>가 설정되지 않아 학생용 인터랙티브 제주 탐험 지도로 대체 표시 중입니다.
                </span>
              </div>
            )}
            {mapMode === 'kakao' && kakaoStatus === 'error' && (
              <div className="map-fallback-notice" role="status">
                <strong>💡 카카오맵 연결 안내</strong>
                <span>
                  카카오맵 SDK 로드 또는 도메인 등록 확인이 필요하여 인터랙티브 제주 탐험 지도로 대체 표시 중입니다.
                </span>
              </div>
            )}

            {/* 제주 전역 전승 신화(자청비 등) 선택 시 안내 오버레이 */}
            {isGlobalMythSelected && (
              <div className="map-global-myth-banner" role="status">
                <span>🌾</span>
                <div>
                  <strong>‘{selectedMyth.title}’는 제주 섬 전체에 전해지는 신화예요!</strong>
                  <p className="mb-0">
                    특정한 한 곳의 유적지가 아니라 제주 전역 마을에서 풍년을 기원하며 부르던 농경 본풀이랍니다.
                  </p>
                </div>
              </div>
            )}

            {/* 인터랙티브 파스텔 제주도 SVG 지도 (실제 방위·지형 반영) */}
            <svg
              viewBox="0 0 680 400"
              className="pastel-jeju-svg"
              role="img"
              aria-label="제주도 신화 탐험 지도"
            >
              {/* 바다 배경 물결 선 */}
              <path
                d="M 35 85 Q 65 77 95 85 T 155 85"
                fill="none"
                stroke="#A9D7F3"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 520 65 Q 550 57 580 65 T 640 65"
                fill="none"
                stroke="#A9D7F3"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 535 335 Q 565 327 595 335 T 655 335"
                fill="none"
                stroke="#A9D7F3"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 45 340 Q 75 332 105 340 T 165 340"
                fill="none"
                stroke="#A9D7F3"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* 제주 본섬 해안선 외곽 (부드러운 모래·해안 링) */}
              <path
                d="M 92 248
                   C 78 210, 118 156, 196 126
                   C 265 98, 338 82, 418 92
                   C 498 102, 578 134, 598 184
                   C 614 226, 568 278, 492 302
                   C 412 326, 312 332, 224 318
                   C 148 306, 104 282, 92 248 Z"
                fill="#FFFDF7"
                stroke="#A9D7F3"
                strokeWidth="8"
              />

              {/* 제주 본섬 파스텔 초록·민트 지형 */}
              <path
                d="M 102 245
                   C 88 210, 126 160, 200 132
                   C 268 106, 338 90, 415 100
                   C 492 110, 568 140, 586 185
                   C 600 222, 558 270, 486 293
                   C 408 316, 312 322, 228 309
                   C 155 298, 112 275, 102 245 Z"
                fill="#E9F5F7"
                stroke="#4FA3B7"
                strokeWidth="3"
              />

              {/* 중산간 곶자왈 파스텔 영역 */}
              <ellipse
                cx="348"
                cy="206"
                rx="165"
                ry="68"
                fill="#DDF0EC"
              />

              {/* 한라산 중앙 능선 및 백록담 */}
              <path
                d="M 265 232 Q 345 142 425 232 Z"
                fill="#BFE3DC"
                stroke="#2F5D50"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <ellipse
                cx="345"
                cy="185"
                rx="20"
                ry="7"
                fill="#FFFDF7"
                stroke="#2F5D50"
                strokeWidth="2"
              />
              <text
                x="345"
                y="222"
                textAnchor="middle"
                fill="#2F5D50"
                fontSize="12"
                fontWeight="800"
              >
                한라산
              </text>

              {/* 작은 오름 실루엣 장식 */}
              <path d="M 435 198 Q 452 176 469 198 Z" fill="#A9D7F3" opacity="0.7" />
              <path d="M 218 228 Q 234 208 250 228 Z" fill="#A9D7F3" opacity="0.7" />

              {/* 방위·지역 라벨 */}
              <text x="335" y="72" textAnchor="middle" fill="#4FA3B7" fontSize="11" fontWeight="700">
                북쪽 바다 (제주시)
              </text>
              <text x="345" y="356" textAnchor="middle" fill="#4FA3B7" fontSize="11" fontWeight="700">
                남쪽 바다 (서귀포시)
              </text>
              <text x="632" y="196" textAnchor="middle" fill="#4FA3B7" fontSize="11" fontWeight="700">
                동쪽 (성산)
              </text>
              <text x="46" y="232" textAnchor="middle" fill="#4FA3B7" fontSize="11" fontWeight="700">
                서쪽 (한경)
              </text>
            </svg>

            {/* 인터랙티브 장소 핀 오버레이 (실제 위경도 위치 대응) */}
            <div className="pastel-map-pins-layer">
              {mapPinnedMyths.map((myth) => {
                const isSelected = selectedMyth?.id === myth.id
                return (
                  <button
                    key={myth.id}
                    type="button"
                    className={`jeju-map-pin ${isSelected ? 'is-selected' : ''} tone-${myth.tone || 'sky'}`}
                    style={{
                      left: `${myth.mapPin.xPercent}%`,
                      top: `${myth.mapPin.yPercent}%`,
                    }}
                    onClick={() => onSelectMyth?.(myth.id)}
                    aria-pressed={isSelected}
                    aria-label={`${myth.mapPin.shortPlace} — ${myth.title} 신화 선택`}
                  >
                    <span className="pin-marker-bubble">
                      <span className="pin-emoji" aria-hidden="true">
                        {myth.mapPin.emoji}
                      </span>
                      <span className="pin-myth-name">{myth.title}</span>
                    </span>
                    <span className="pin-place-sub">{myth.mapPin.shortPlace}</span>
                    <span className="pin-tail" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 숨겨진 카카오맵 컨테이너 (카카오 모드 로딩 중일 때 참조 유지) */}
        {mapMode === 'kakao' && kakaoStatus === 'loading' && (
          <div ref={mapContainerRef} className="kakao-map-canvas is-loading" />
        )}
      </div>

      {/* 지도 하단 빠른 장소 선택 칩 바 */}
      <div className="explorer-map-chips" aria-label="신화 장소 빠른 선택">
        {mapPinnedMyths.map((myth) => {
          const active = selectedMyth?.id === myth.id
          return (
            <button
              key={myth.id}
              type="button"
              className={`map-place-chip ${active ? 'is-active' : ''}`}
              onClick={() => onSelectMyth?.(myth.id)}
            >
              <span>{myth.mapPin.emoji}</span>
              <span>{myth.mapPin.shortPlace}</span>
              <small>({myth.title})</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}
