import SelectedPlaceDetails from '../components/SelectedPlaceDetails'
import StoryFavoriteButton from '../components/StoryFavoriteButton'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import JejuMythExplorerMap from '../components/JejuMythExplorerMap'
import MythCard from '../components/MythCard'
import StoryPanel from '../components/StoryPanel'
import mapPinsData from '../data/jejuMapPins.json'
import { getMythQuizPuzzle } from '../data/mythQuizPuzzles'
import { HOME_STORIES, VERIFIED_PLACE_COUNT } from '../data/storyCatalog'

const PIN_BY_MYTH_ID = Object.fromEntries(mapPinsData.map((p) => [p.mythId, p]))

export default function Home() {
  const [selectedId, setSelectedId] = useState(HOME_STORIES[0].id)
  const [sceneIndex, setSceneIndex] = useState(0)
  const selected = HOME_STORIES.find((m) => m.id === selectedId) || HOME_STORIES[0]
  const selectedPin = PIN_BY_MYTH_ID[selected.id] || selected.mapPin
  const hasPuzzleForSelected = Boolean(getMythQuizPuzzle(selected.id))
  const kakaoRouteUrl = selectedPin?.realGeoCoords
    ? `https://map.kakao.com/link/to/${encodeURIComponent(selectedPin.realGeoCoords.kakaoPlaceName || selectedPin.placeName)},${selectedPin.realGeoCoords.lat},${selectedPin.realGeoCoords.lng}`
    : null

  function handleSelectMyth(id) {
    setSelectedId(id)
    setSceneIndex(0)
  }

  function handleJumpToStory() {
    document.getElementById('story-reader-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="student-home">
      {/* 1. 간결한 메인 타이틀 영역 (긴 설명 박스 제거) */}
      <header className="map-home-header text-center mb-4">
        <span className="hero-cute-badge">🧭 제주 신화 탐험 지도</span>
        <h1 className="myth-hero-title mt-2 mb-1">
          제주에는 어떤 이야기가 숨어 있을까?
        </h1>
        <p className="myth-hero-sub mb-0">
          지도 위의 신화 장소를 눌러 숨겨진 이야기를 발견하고, 퀴즈 퍼즐과 AI 안내원까지 함께 탐험해 보세요!
        </p>
      </header>

      {/* 2. 메인 영역: 제주 탐험 지도 + 선택한 장소의 신화 요약 & 기능 이동 카드 */}
      <section aria-label="제주 신화 탐험 지도와 선택 장소 소개" className="explorer-main-grid">
        {/* 왼쪽: SVG 그림책 제주 탐험 지도 (jejuMapPins.json 기반 핀 + 카카오맵 연동) */}
        <JejuMythExplorerMap
          selectedMythId={selected.id}
          onSelectMyth={handleSelectMyth}
        />

        {/* 오른쪽: 선택한 장소와 연결된 신화의 짧은 소개 & 바로가기 액션 (핀 클릭 시 전환 애니메이션) */}
        <aside
          key={selected.id}
          className="selected-spot-panel surface spot-card-animate"
          aria-live="polite"
        >
          <div className="spot-panel-top">
            <span className="spot-tag-pill">{selected.tag}</span>
            <span className="spot-verified-pill">
              {selectedPin?.hasVerifiedLocation === false ? '🌾 제주 전역 전승' : '📍 실제 장소 확인됨'}
            </span>
          </div>

          <div className="spot-place-box mt-2">
            <span className="spot-place-emoji" aria-hidden="true">
              {selectedPin?.emoji || '📍'}
            </span>
            <div>
              <span className="spot-place-label">
                {selectedPin?.regionLabel || '연결된 신화 장소'}
              </span>
              <strong className="spot-place-title d-block">
                {selectedPin?.location?.name || selectedPin?.fullPlaceName || selected.place}
              </strong>
            </div>
          </div>

          <h2 className="spot-myth-title mt-3 mb-1">{selected.title}</h2>
          <p className="spot-myth-question mb-2">“{selected.question}”</p>
          <p className="spot-myth-intro mb-3">{selected.shortIntro}</p>

          {selectedPin?.verifiedNote && (
            <div className="spot-evidence-note mb-3">
              <i className="bi bi-patch-check-fill me-1" />
              <span>{selectedPin.verifiedNote}</span>
            </div>
          )}

          <SelectedPlaceDetails key={selected.id} pin={selectedPin} />

          {/* 핵심 기능 이동 버튼: 이야기 읽기 / 퀴즈 풀기 / AI에게 물어보기 / 카카오맵 길찾기 */}
          <div className="spot-action-grid">
            <button
              type="button"
              className="btn btn-primary btn-round spot-action-btn"
              onClick={handleJumpToStory}
            >
              <i className="bi bi-book-half me-1" />
              이야기 읽기
            </button>

            <Link
              to={`/explore/${hasPuzzleForSelected ? selected.id : 'seolmundae'}`}
              className="btn btn-outline-sea btn-round spot-action-btn"
            >
              <i className="bi bi-puzzle me-1" />
              {hasPuzzleForSelected ? '퀴즈 풀기 (3조각 퍼즐)' : '설문대할망 퀴즈 풀기'}
            </Link>

            <Link
              to="/agent"
              className="btn btn-outline-sea btn-round spot-action-btn"
            >
              <i className="bi bi-chat-dots me-1" />
              AI에게 물어보기
            </Link>

            {kakaoRouteUrl ? (
              <a
                href={kakaoRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-sea btn-round spot-action-btn"
              >
                <i className="bi bi-geo-alt me-1" />
                카카오맵 위치·길찾기
              </a>
            ) : (
              <Link
                to="/explore"
                className="btn btn-outline-sea btn-round spot-action-btn"
              >
                <i className="bi bi-compass me-1" />
                신화 도감 보기
              </Link>
            )}
          </div>
        </aside>
      </section>

      {/* 3. 지도 아래: 지도 위치가 없는 신화(자청비)까지 포함한 전체 이야기 탐색 카드 */}
      <section aria-labelledby="all-myth-cards" className="mt-4 pt-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2 id="all-myth-cards" className="section-cute-title mb-0">
              신화전설이야기
            </h2>
            <p className="section-cute-sub mb-0">
              실제 지도 장소 {VERIFIED_PLACE_COUNT}곳과 전체 이야기 수는 달라요. 장소가 없는 이야기도 함께 읽어 보세요.
            </p>
          </div>
          <Link to="/explore" className="btn btn-outline-sea btn-sm btn-round">
            <i className="bi bi-compass me-1" />전체 이야기 보기
          </Link>
        </div>

        <Row className="g-3">
          {HOME_STORIES.map((m) => (
            <Col key={m.id} xs={12} sm={6} lg={3}>
              <MythCard
                myth={m}
                selected={m.id === selectedId}
                onSelect={handleSelectMyth}
              />
            </Col>
          ))}
        </Row>
      </section>

      {/* 4. 선택한 이야기의 장면별 그림책 리더 */}
      <section
        id="story-reader-section"
        className="mt-4 pt-3"
        aria-live="polite"
        aria-label="선택한 신화 이야기 읽기"
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <h2 className="section-cute-title mb-0">
            📖 {selected.title} 이야기 그림책
          </h2>
          <span className="story-count-pill">장면별 쉬운 2~3문장 풀이</span>
        </div>

        <StoryPanel
          storyId={selected.id}
          title={selected.title}
          question={selected.question}
          scene={selected.scenes?.[sceneIndex]}
          source={selected.source}
          sceneIndex={sceneIndex}
          sceneCount={selected.scenes?.length ?? 1}
          onSceneChange={setSceneIndex}
          placeBridge={selected.placeBridge}
          preferPastelArt
        />
      </section>

      <StoryFavoriteButton storyId={selected.id} storyTitle={selected.title} />
    </div>
  )
}
