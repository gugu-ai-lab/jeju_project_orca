import { useEffect, useRef, useState } from 'react'
import mapPinsData from '../data/jejuMapPins.json'

/**
 * JejuMythExplorerMap — 그림책 속 귀여운 SVG 제주도 일러스트 탐험 지도 + 카카오맵 연동
 *
 * 설계 원칙:
 * 1. 핀 데이터는 별도 JSON(`src/data/jejuMapPins.json`)에서 불러오며,
 *    일러스트 표시 좌표(`illustrationCoords`)와 실제 위경도 좌표(`realGeoCoords`)를 명확히 분리한다.
 * 2. 검증된 실제 장소가 있는 6곳만 지도에 핀으로 표시하고, 단일 고정 위치가 없는 신화(`자청비`)는
 *    임의의 핀을 만들지 않고 안내 배너로 정직하게 표시한다.
 * 3. 과한 그라데이션 없이 아이보리·파스텔 하늘색·민트·블루그린 단색 조합으로
 *    실제 제주 해안선 윤곽, 한라산 백록담, 오름, 현무암 돌담, 부속 섬(우도·차귀도·비양도·마라도)을 귀엽게 표현한다.
 */
export default function JejuMythExplorerMap({
  selectedMythId,
  onSelectMyth,
}) {
  const kakaoKey =
    import.meta.env.VITE_KAKAO_MAP_KEY ||
    import.meta.env.VITE_KAKAO_JS_KEY ||
    import.meta.env.VITE_KAKAO_APP_KEY ||
    ''

  const [mapMode, setMapMode] = useState('pastel') // 'pastel' | 'kakao'
  const [kakaoStatus, setKakaoStatus] = useState(kakaoKey ? 'idle' : 'no-key')
  const [bouncingPinId, setBouncingPinId] = useState(null)

  const mapContainerRef = useRef(null)
  const kakaoMapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const onSelectRef = useRef(onSelectMyth)

  useEffect(() => {
    onSelectRef.current = onSelectMyth
  }, [onSelectMyth])

  // JSON에서 실제 위치가 검증된 핀(6곳)만 필터링
  const verifiedPins = mapPinsData.filter((p) => p.hasVerifiedLocation && p.illustrationCoords)
  const selectedPin = mapPinsData.find((p) => p.mythId === selectedMythId) || verifiedPins[0]
  const isGlobalMythSelected = selectedPin && !selectedPin.hasVerifiedLocation

  function handlePinClick(pin) {
    setBouncingPinId(pin.pinId)
    onSelectMyth?.(pin.mythId)
  }

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

  // 실제 위치 및 길 찾기용 카카오맵 SDK 로드 (realGeoCoords 사용)
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
          const centerLat = selectedPin?.realGeoCoords?.lat || 33.3846
          const centerLng = selectedPin?.realGeoCoords?.lng || 126.5535
          const map = new window.kakao.maps.Map(mapContainerRef.current, {
            center: new window.kakao.maps.LatLng(centerLat, centerLng),
            level: 10,
          })
          kakaoMapInstanceRef.current = map

          markersRef.current.forEach((m) => m.setMap(null))
          markersRef.current = []

          verifiedPins.forEach((pin) => {
            if (!pin.realGeoCoords) return
            const pos = new window.kakao.maps.LatLng(
              pin.realGeoCoords.lat,
              pin.realGeoCoords.lng
            )
            const marker = new window.kakao.maps.Marker({
              position: pos,
              title: `${pin.mythTitle} · ${pin.placeName}`,
            })
            marker.setMap(map)
            window.kakao.maps.event.addListener(marker, 'click', () => {
              onSelectRef.current?.(pin.mythId)
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

  // 선택한 핀이 바뀌면 카카오맵 중심 이동
  useEffect(() => {
    if (
      mapMode === 'kakao' &&
      kakaoStatus === 'ready' &&
      kakaoMapInstanceRef.current &&
      window.kakao?.maps &&
      selectedPin?.realGeoCoords
    ) {
      const moveLatLon = new window.kakao.maps.LatLng(
        selectedPin.realGeoCoords.lat,
        selectedPin.realGeoCoords.lng
      )
      kakaoMapInstanceRef.current.panTo(moveLatLon)
    }
  }, [selectedPin, mapMode, kakaoStatus])

  // 카카오맵 외부 길찾기 URL 생성 (실제 좌표 기준)
  const kakaoDirectionsUrl = selectedPin?.realGeoCoords
    ? `https://map.kakao.com/link/to/${encodeURIComponent(selectedPin.realGeoCoords.kakaoPlaceName || selectedPin.placeName)},${selectedPin.realGeoCoords.lat},${selectedPin.realGeoCoords.lng}`
    : null

  return (
    <div className="explorer-map-card">
      {/* 지도 상단 컨트롤 바 */}
      <div className="explorer-map-topbar">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="map-badge-pill">
            🗺️ 신화 탐험 핀 <strong>{verifiedPins.length}곳</strong>
          </span>
          <span className="map-hint-text">
            지도 위 귀여운 핀을 눌러 이야기를 열어 보세요!
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
          <div className="map-mode-switch" role="group" aria-label="지도 표시 방식 선택">
            <button
              type="button"
              className={`map-mode-btn ${mapMode === 'pastel' ? 'is-active' : ''}`}
              onClick={() => handleSelectMode('pastel')}
            >
              🎨 그림책 탐험 지도
            </button>
            <button
              type="button"
              className={`map-mode-btn ${mapMode === 'kakao' ? 'is-active' : ''}`}
              onClick={() => handleSelectMode('kakao')}
            >
              📍 카카오맵
            </button>
          </div>
        </div>
      </div>

      {/* 메인 지도 스테이지 */}
      <div className="explorer-map-stage">
        {mapMode === 'kakao' && kakaoStatus === 'ready' ? (
          <div
            ref={mapContainerRef}
            className="kakao-map-canvas"
            aria-label="카카오맵 제주 신화 실제 위치 지도"
          />
        ) : (
          <div className="pastel-jeju-map-wrap">
            {/* 카카오맵 모드를 선택했으나 API 키가 없거나 로드 전인 경우 안내 배너 */}
            {mapMode === 'kakao' && kakaoStatus === 'no-key' && (
              <div className="map-fallback-notice" role="status">
                <strong>💡 카카오맵 API 키 미설정 안내</strong>
                <span>
                  현재 환경에 <code>VITE_KAKAO_MAP_KEY</code>가 없어 그림책 제주 일러스트 지도로 표시 중입니다. 상단 <strong>‘실제 위치·길찾기’</strong> 버튼으로 카카오맵 실제 좌표를 바로 열 수 있어요!
                </span>
              </div>
            )}
            {mapMode === 'kakao' && kakaoStatus === 'error' && (
              <div className="map-fallback-notice" role="status">
                <strong>💡 카카오맵 연결 안내</strong>
                <span>
                  카카오맵 SDK 도메인 확인이 필요하여 그림책 제주 일러스트 지도로 대체 표시 중입니다.
                </span>
              </div>
            )}

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

            {/* 그림책 속 귀여운 제주도 일러스트 지도 (800×480, 단색 파스텔 톤) */}
            <svg
              viewBox="0 0 800 480"
              className="pastel-jeju-svg"
              role="img"
              aria-label="한라산, 오름, 현무암, 바다가 그려진 제주도 신화 탐험 일러스트 지도"
            >
              {/* 1. 파스텔 제주 바다 배경 장식 (잔잔한 물결과 나침반) */}
              <g className="svg-sea-decor" aria-hidden="true">
                {/* 귀여운 탐험 나침반 (좌측 상단) */}
                <g transform="translate(68, 66)">
                  <circle cx="0" cy="0" r="26" fill="#FFFDF7" stroke="#A9D7F3" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="20" fill="none" stroke="#DCEAEF" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polygon points="0,-16 -5,0 5,0" fill="#2F5D50" />
                  <polygon points="0,16 -5,0 5,0" fill="#A9D7F3" />
                  <circle cx="0" cy="0" r="3" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="2" />
                  <text x="0" y="-29" textAnchor="middle" fill="#2F5D50" fontSize="11" fontWeight="800">N</text>
                </g>

                {/* 바다 잔물결 (단색 선) */}
                <path d="M 150 56 Q 165 48 180 56 T 210 56" fill="none" stroke="#A9D7F3" strokeWidth="3" strokeLinecap="round" />
                <path d="M 575 52 Q 590 44 605 52 T 635 52" fill="none" stroke="#A9D7F3" strokeWidth="3" strokeLinecap="round" />
                <path d="M 65 365 Q 80 357 95 365 T 125 365" fill="none" stroke="#A9D7F3" strokeWidth="3" strokeLinecap="round" />
                <path d="M 635 395 Q 650 387 665 395 T 695 395" fill="none" stroke="#A9D7F3" strokeWidth="3" strokeLinecap="round" />
                <path d="M 445 432 Q 460 424 475 432 T 505 432" fill="none" stroke="#A9D7F3" strokeWidth="2.5" strokeLinecap="round" />

                {/* 성산 동쪽 바다의 작은 나무배/상자 모티프 (벽랑국 삼공주 설화 상징) */}
                <g transform="translate(722, 268)">
                  <path d="M -16 0 L 16 0 L 11 9 L -11 9 Z" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="2" strokeLinejoin="round" />
                  <rect x="-6" y="-8" width="12" height="8" rx="2" fill="#A9D7F3" stroke="#2F5D50" strokeWidth="1.8" />
                  <path d="M -20 13 Q -10 9 0 13 T 20 13" fill="none" stroke="#4FA3B7" strokeWidth="2" strokeLinecap="round" />
                </g>
              </g>

              {/* 2. 제주 부속 섬 일러스트 (비양도 · 차귀도 · 우도 · 가파도 · 마라도) */}
              <g className="svg-sub-islands" aria-hidden="true">
                {/* 북서쪽 비양도 (한림 앞바다) */}
                <path
                  d="M 152 162 C 146 154, 160 145, 169 152 C 175 157, 168 167, 158 166 Z"
                  fill="#FFFDF7"
                  stroke="#4FA3B7"
                  strokeWidth="2.2"
                />
                <circle cx="160" cy="157" r="5" fill="#D5EFEA" />
                <text x="148" y="141" textAnchor="middle" fill="#4FA3B7" fontSize="10" fontWeight="700">비양도</text>

                {/* 서쪽 차귀도 (한경 수월봉 앞바다) */}
                <path
                  d="M 76 276 C 72 268, 86 262, 95 268 C 100 274, 91 283, 81 281 Z"
                  fill="#FFFDF7"
                  stroke="#4FA3B7"
                  strokeWidth="2.2"
                />
                <text x="84" y="257" textAnchor="middle" fill="#4FA3B7" fontSize="10" fontWeight="700">차귀도</text>

                {/* 동쪽 우도 (성산 앞바다 소 모양 섬) */}
                <path
                  d="M 720 144 C 714 130, 732 115, 746 122 C 756 128, 758 148, 748 158 C 736 166, 723 156, 720 144 Z"
                  fill="#FFFDF7"
                  stroke="#4FA3B7"
                  strokeWidth="2.5"
                />
                <path d="M 726 142 C 724 134, 736 125, 744 131 C 749 136, 747 148, 738 151 Z" fill="#D5EFEA" />
                <text x="738" y="111" textAnchor="middle" fill="#2F5D50" fontSize="11" fontWeight="800">우도</text>

                {/* 남서쪽 가파도 & 마라도 */}
                <ellipse cx="196" cy="408" rx="14" ry="6" fill="#FFFDF7" stroke="#4FA3B7" strokeWidth="2" />
                <text x="196" y="426" textAnchor="middle" fill="#4FA3B7" fontSize="9.5" fontWeight="700">가파도</text>
                <ellipse cx="188" cy="444" rx="10" ry="4.5" fill="#FFFDF7" stroke="#4FA3B7" strokeWidth="2" />
                <text x="188" y="461" textAnchor="middle" fill="#4FA3B7" fontSize="9.5" fontWeight="700">마라도</text>
              </g>

              {/* 3. 제주 본섬 실제 지형 윤곽 (해안 모래 테두리 + 파스텔 초록 대지) */}
              <g className="svg-main-island">
                {/* 바깥 얕은 물결 테두리 (파스텔 하늘) */}
                <path
                  d="M 116 266
                     C 110 245, 130 222, 152 204
                     C 172 188, 188 170, 218 155
                     C 252 138, 286 132, 322 118
                     C 355 104, 388 94, 424 96
                     C 460 98, 492 108, 528 104
                     C 568 100, 608 106, 642 124
                     C 672 140, 694 164, 706 188
                     C 715 205, 698 218, 690 232
                     C 680 250, 666 268, 640 286
                     C 610 306, 574 322, 534 336
                     C 490 352, 444 358, 396 360
                     C 348 362, 304 356, 266 358
                     C 234 360, 206 372, 178 362
                     C 154 352, 148 326, 136 306
                     C 124 288, 120 280, 116 266 Z"
                  fill="#FFFDF7"
                  stroke="#A9D7F3"
                  strokeWidth="11"
                  strokeLinejoin="round"
                />

                {/* 제주 본섬 아이보리 모래 해안선 & 파스텔 민트 들판 */}
                <path
                  d="M 116 266
                     C 110 245, 130 222, 152 204
                     C 172 188, 188 170, 218 155
                     C 252 138, 286 132, 322 118
                     C 355 104, 388 94, 424 96
                     C 460 98, 492 108, 528 104
                     C 568 100, 608 106, 642 124
                     C 672 140, 694 164, 706 188
                     C 715 205, 698 218, 690 232
                     C 680 250, 666 268, 640 286
                     C 610 306, 574 322, 534 336
                     C 490 352, 444 358, 396 360
                     C 348 362, 304 356, 266 358
                     C 234 360, 206 372, 178 362
                     C 154 352, 148 326, 136 306
                     C 124 288, 120 280, 116 266 Z"
                  fill="#E9F5F7"
                  stroke="#4FA3B7"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />

                {/* 중산간 곶자왈 파스텔 초록 지대 */}
                <path
                  d="M 192 252
                     C 186 212, 245 162, 342 146
                     C 438 130, 558 144, 612 192
                     C 644 220, 616 268, 542 296
                     C 466 324, 336 328, 254 304
                     C 208 290, 196 274, 192 252 Z"
                  fill="#D5EFEA"
                />

                {/* 한라산 기슭 깊은 숲 지대 */}
                <ellipse cx="408" cy="232" rx="132" ry="56" fill="#C2E6DF" />
              </g>

              {/* 4. 신화 장소를 잇는 귀여운 점선 탐험 길 */}
              <path
                d="M 356 128 Q 392 112 424 106 Q 455 152 468 208 Q 560 218 644 226 Q 480 325 252 352 Q 180 325 136 276 Q 230 190 356 128"
                fill="none"
                stroke="#4FA3B7"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
                opacity="0.65"
              />

              {/* 5. 제주 자연·문화 일러스트 요소 (한라산·백록담·오름·현무암·산방산·성산일출봉) */}
              <g className="svg-jeju-landmarks" aria-hidden="true">
                {/* 중앙 한라산과 백록담 */}
                <g transform="translate(398, 224)">
                  {/* 산자락 */}
                  <path
                    d="M -92 34 C -68 -6, -36 -48, 0 -52 C 36 -48, 68 -6, 92 34 Z"
                    fill="#4FA3B7"
                    stroke="#2F5D50"
                    strokeWidth="2.8"
                    strokeLinejoin="round"
                  />
                  {/* 정상 능선 */}
                  <path
                    d="M -56 34 C -38 2, -20 -36, 0 -42 C 20 -36, 38 2, 56 34 Z"
                    fill="#2F5D50"
                  />
                  {/* 백록담 분화구 호수 */}
                  <ellipse
                    cx="0"
                    cy="-40"
                    rx="22"
                    ry="7.5"
                    fill="#FFFDF7"
                    stroke="#2F5D50"
                    strokeWidth="2.5"
                  />
                  <ellipse cx="0" cy="-40" rx="14" ry="4" fill="#A9D7F3" />
                  {/* 한라산 옆 귀여운 구름 */}
                  <path
                    d="M -78 -24 C -78 -31, -66 -34, -60 -28 C -54 -34, -42 -30, -42 -22 C -42 -17, -78 -17, -78 -24 Z"
                    fill="#FFFDF7"
                    stroke="#A9D7F3"
                    strokeWidth="1.8"
                  />
                  {/* 영실 오백장군 바위 기둥 모티프 (남서쪽 사면) */}
                  <rect x="-54" y="2" width="6" height="16" rx="3" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="1.8" />
                  <rect x="-45" y="-2" width="6" height="20" rx="3" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="1.8" />
                  <rect x="-36" y="4" width="6" height="14" rx="3" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="1.8" />
                  {/* 한라산 라벨 */}
                  <rect x="-34" y="14" width="68" height="20" rx="10" fill="#FFFDF7" stroke="#2F5D50" strokeWidth="1.8" />
                  <text x="0" y="28" textAnchor="middle" fill="#2F5D50" fontSize="11.5" fontWeight="800">
                    한라산
                  </text>
                </g>

                {/* 동쪽 오름 군락 (귀여운 둥근 오름들) */}
                <g transform="translate(546, 174)">
                  <path d="M -28 18 Q -12 -10 4 18 Z" fill="#A9D7F3" stroke="#2F5D50" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M -6 20 Q 14 -14 34 20 Z" fill="#4FA3B7" stroke="#2F5D50" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M 8 -2 Q 14 2 20 -2" fill="none" stroke="#FFFDF7" strokeWidth="2" strokeLinecap="round" />
                  <text x="4" y="33" textAnchor="middle" fill="#2F5D50" fontSize="10" fontWeight="700">동부 오름군락</text>
                </g>

                {/* 서쪽 오름 군락 (금악·한림 방면) */}
                <g transform="translate(246, 212)">
                  <path d="M -24 16 Q -8 -8 8 16 Z" fill="#A9D7F3" stroke="#2F5D50" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M 0 18 Q 16 -6 32 18 Z" fill="#4FA3B7" stroke="#2F5D50" strokeWidth="2" strokeLinejoin="round" />
                  <text x="4" y="31" textAnchor="middle" fill="#2F5D50" fontSize="10" fontWeight="700">서부 오름</text>
                </g>

                {/* 동쪽 끝 성산일출봉 왕관 바위 일러스트 */}
                <g transform="translate(692, 184)">
                  <path
                    d="M -18 14 L -13 -6 L -6 -2 L 0 -8 L 6 -2 L 13 -6 L 18 14 Z"
                    fill="#4FA3B7"
                    stroke="#2F5D50"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="0" cy="-3" rx="9" ry="3" fill="#D5EFEA" />
                </g>

                {/* 남서쪽 안덕 산방산 종 모양 돔 & 동굴 일러스트 */}
                <g transform="translate(226, 336)">
                  <path
                    d="M -22 14 C -18 -16, 18 -16, 22 14 Z"
                    fill="#2F5D50"
                    stroke="#FFFDF7"
                    strokeWidth="2"
                  />
                  <path d="M -6 14 C -6 4, 6 4, 6 14 Z" fill="#A9D7F3" />
                </g>

                {/* 서쪽 수월봉 해안 화산재 지층 절벽 모티프 */}
                <g transform="translate(132, 294)">
                  <path d="M -16 10 L -14 -8 L 12 -4 L 16 10 Z" fill="#4FA3B7" stroke="#2F5D50" strokeWidth="1.8" />
                  <line x1="-12" y1="-2" x2="11" y2="0" stroke="#FFFDF7" strokeWidth="1.8" />
                  <line x1="-13" y1="4" x2="13" y2="5" stroke="#FFFDF7" strokeWidth="1.8" />
                </g>

                {/* 귀여운 제주 현무암 돌담 & 구멍 뽕뽕 현무암 바위 */}
                <g transform="translate(310, 166)">
                  <ellipse cx="0" cy="0" rx="11" ry="8" fill="#3D5A52" />
                  <circle cx="-4" cy="-2" r="1.4" fill="#FFFDF7" />
                  <circle cx="3" cy="-1" r="1.2" fill="#FFFDF7" />
                  <circle cx="0" cy="3" r="1.3" fill="#FFFDF7" />
                  <ellipse cx="14" cy="3" rx="8" ry="6" fill="#4FA3B7" />
                </g>
                <g transform="translate(495, 292)">
                  <ellipse cx="0" cy="0" rx="11" ry="8" fill="#3D5A52" />
                  <circle cx="-3" cy="-2" r="1.4" fill="#FFFDF7" />
                  <circle cx="4" cy="0" r="1.2" fill="#FFFDF7" />
                  <circle cx="-1" cy="3" r="1.3" fill="#FFFDF7" />
                  <ellipse cx="-13" cy="3" rx="7.5" ry="5.5" fill="#4FA3B7" />
                </g>

                {/* 곶자왈 귀여운 둥근 나무들 */}
                <g transform="translate(322, 268)">
                  <circle cx="0" cy="-6" r="9" fill="#2F5D50" />
                  <circle cx="12" cy="-4" r="7.5" fill="#4FA3B7" />
                  <line x1="0" y1="2" x2="0" y2="9" stroke="#2F5D50" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="12" y1="3" x2="12" y2="9" stroke="#2F5D50" strokeWidth="2" strokeLinecap="round" />
                </g>
                <g transform="translate(512, 238)">
                  <circle cx="0" cy="-6" r="8.5" fill="#2F5D50" />
                  <circle cx="-11" cy="-3" r="7" fill="#4FA3B7" />
                  <line x1="0" y1="2" x2="0" y2="8" stroke="#2F5D50" strokeWidth="2.2" strokeLinecap="round" />
                </g>

                {/* 지역 방위 안내 캡션 */}
                <text x="395" y="76" textAnchor="middle" fill="#2F5D50" fontSize="11.5" fontWeight="800">
                  북쪽 바다 · 제주시
                </text>
                <text x="415" y="394" textAnchor="middle" fill="#2F5D50" fontSize="11.5" fontWeight="800">
                  남쪽 바다 · 서귀포시
                </text>
              </g>
            </svg>

            {/* 6. JSON 기반 클릭 가능한 신화 장소 핀 오버레이 */}
            <div className="pastel-map-pins-layer">
              {verifiedPins.map((pin) => {
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
                      left: `${pin.illustrationCoords.xPercent}%`,
                      top: `${pin.illustrationCoords.yPercent}%`,
                    }}
                    onClick={() => handlePinClick(pin)}
                    onAnimationEnd={() => setBouncingPinId(null)}
                    aria-pressed={isSelected}
                    aria-label={`${pin.placeName} (${pin.mythTitle}) 신화 선택`}
                  >
                    {isSelected && <span className="pin-pulse-ring" aria-hidden="true" />}
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
        )}

        {mapMode === 'kakao' && kakaoStatus === 'loading' && (
          <div ref={mapContainerRef} className="kakao-map-canvas is-loading" />
        )}
      </div>

      {/* 지도 하단 JSON 핀 빠른 선택 칩 바 */}
      <div className="explorer-map-chips" aria-label="신화 장소 빠른 선택">
        {verifiedPins.map((pin) => {
          const active = selectedPin?.pinId === pin.pinId
          return (
            <button
              key={pin.pinId}
              type="button"
              className={`map-place-chip ${active ? 'is-active' : ''}`}
              onClick={() => handlePinClick(pin)}
            >
              <span>{pin.emoji}</span>
              <span>{pin.placeName}</span>
              <small>({pin.mythTitle})</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}
