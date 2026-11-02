import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import MythCard from '../components/MythCard'
import StoryPanel from '../components/StoryPanel'
import SourceCredit from '../components/SourceCredit'
import { MYTH_PREVIEW } from '../data/mythPreview'
import { MYTH_SCENES, MYTH_SOURCE } from '../data/mythStories'

// 첫 화면 전용 화첩 해설·장소 연결 메타데이터 (검증 문서 CODEX_AUDIT_REVIEW_2026-11-02.md 기준)
const MYTH_EDITORIAL_META = {
  seolmundae: {
    chapterLabel: '제 1 장 · 창세신화',
    genreLabel: '창세·거인신화',
    subtitle: '치마폭에 흙을 날라 한라산과 오름을 빚은 거인 여신의 이야기',
    placeLabel: '테마공원 · 제주돌문화공원 / 설화 배경 · 영실기암',
    statusNote: '원본 삽화 2장면 · CSV 28·29행 원문 수록',
    placeBridge: {
      relationBadge: '원문 자연 배경 + 현대 신화 테마공원',
      regionBadge: '제주시 조천읍 · 한라산 영실',
      placeName: '제주돌문화공원 & 한라산 영실기암과 오백나한',
      description:
        '설화 원문에서는 한라산·영실기암(오백장군)·성산일출봉·범섬·오름이 거인 여신의 흔적으로 전해지며, 제주돌문화공원은 이 설문대할망 신화를 주제로 조성된 현대 문화공간입니다.',
      evidence:
        '신화전설_삽화_설명.csv(28·29행) · 제주역사문화일반정보(#519, #799) · 국가유산청 명승 「영실기암과 오백나한」',
      storyLink: '/explore/seolmundae',
    },
  },
  samsinin: {
    chapterLabel: '제 2 장 · 개국신화',
    genreLabel: '탐라 건국신화',
    subtitle: '고을나·부을나·양을나 삼신인이 땅에서 솟아나 도읍을 정한 발상지',
    placeLabel: '발상 유적 · 제주 삼성혈 (제주시 삼성로 22)',
    statusNote: '원본 삽화 2장면 · TourAPI·국가유산청 사적 확인',
    emptyStoryNote:
      '두 번째 삽화 「제주신화전설_삼성혈(삼신의3공주).png」는 CSV 23행 표제어(삼신인의 3공주)와 파일명 철자 차이가 있어, 원문 보존 원칙에 따라 그림만 먼저 감상하고 줄거리는 제1장면 원문을 참고합니다.',
    placeBridge: {
      relationBadge: '원문 직접 명시 · 사적 지정 유적',
      regionBadge: '제주시 이도일동 (삼성로 22)',
      placeName: '제주 삼성혈 (三姓穴)',
      description:
        '탐라 개국 신화에서 고을나·부을나·양을나 삼신인이 동시에 태어나 수렵 생활을 시작하고, 한라산 중턱에서 활을 쏘아 정주할 도읍터를 정했다는 전설적 발상지입니다.',
      evidence:
        '신화전설_삽화_설명.csv(22행) · 한국관광공사 TourAPI(ID 127744, 33.5041, 126.5289) · 국가유산청 사적',
      storyLink: '/explore/samsinin',
    },
  },
  honinji: {
    chapterLabel: '제 3 장 · 농경개국신화',
    genreLabel: '혼례·농경 기원',
    subtitle: '벽랑국 세 공주가 오곡의 씨앗을 안고 도착해 삼신인과 혼례를 올린 곳',
    placeLabel: '혼례 유적 · 성산 온평리 혼인지 · 연혼포',
    statusNote: '단독 삽화 미수록 · 역사문화일반정보 #2945 유적 확인',
    emptyStoryNote:
      '공식 삽화 아카이브(ZIP 42점·CSV 59행)에는 「혼인지」 단독 제목의 파일과 행이 없어 삼성혈 삽화를 임의 전용하지 않았습니다. 대신 제주역사문화일반정보(#2945)와 국가유산청 시도기념물 기록으로 검증된 현장 유적을 안내합니다.',
    placeBridge: {
      relationBadge: '공공데이터 본문 교차 검증 유적',
      regionBadge: '서귀포시 성산읍 온평리',
      placeName: '혼인지(婚姻池) & 온평리 해안(연혼포)',
      description:
        '동해 벽랑국에서 목함을 타고 온 세 공주를 삼신인이 온평리 해안(연혼포)에서 맞이하고, 이곳 연못과 굴에서 혼례를 올리며 탐라의 오곡 농경 문화가 시작되었다고 전해집니다.',
      evidence:
        '제주역사문화일반·위치정보 #2945(온평리 해안, 33.4159, 126.9105) · 국가유산청 시도기념물 「혼인지」 · 제주신화정보 OpenAPI',
      storyLink: '/explore/honinji',
    },
  },
}

export default function Home() {
  // 공식 자료가 있는 신화는 실제 자료로, 없는 신화만 예시(preview)로 표시
  const myths = MYTH_PREVIEW.map((m) => {
    const scenes = MYTH_SCENES[m.id]
    const meta = MYTH_EDITORIAL_META[m.id] || {}
    return {
      ...m,
      ...meta,
      scenes,
      thumb: scenes?.[0]?.image,
      source: scenes ? MYTH_SOURCE : undefined,
      preview: !scenes,
    }
  })

  const [selectedId, setSelectedId] = useState(myths[0].id)
  const [sceneIndex, setSceneIndex] = useState(0)
  const selected = myths.find((m) => m.id === selectedId) || myths[0]

  // 히어로 우측 대표 화첩 쇼케이스는 선택된 신화의 삽화를 우선 보여주되,
  // 단독 삽화가 없는 혼인지 선택 시에도 설문대할망·삼성혈 원본 삽화를 참고 화첩으로 유지한다.
  const activeScene = selected.scenes?.[sceneIndex]
  const fallbackMyth = myths[0]
  const heroScene = activeScene?.image ? activeScene : fallbackMyth.scenes?.[0]
  const heroMythTitle = activeScene?.image ? selected.title : `${fallbackMyth.title} (대표 수록 화첩)`

  function handleSelectMyth(id) {
    setSelectedId(id)
    setSceneIndex(0)
  }

  return (
    <div className="home-codex-page">
      {/* 1. 몰입형 신화 그림책 히어로 (A의 대형 화첩 감성 + B의 탐험 입구) */}
      <section className="myth-hero" aria-label="제주 신화 화첩 소개">
        <div className="myth-hero-grid">
          <div className="myth-hero-copy">
            <div className="myth-hero-badges">
              <span className="section-eyebrow">탐라 신화 화첩 × 제주 여정 아틀라스</span>
              <span className="hero-verify-pill">
                <i className="bi bi-patch-check-fill me-1" />공공데이터 원문·출처 기반
              </span>
            </div>

            <h1 className="myth-hero-title font-myth">
              오래된 신화의 책장을 넘기면,
              <br />
              제주의 숲과 바다가 말을 건넵니다
            </h1>

            <p className="lead myth-hero-lead">
              거인 여신이 치마폭으로 빚어낸 오름부터 삼신인이 활을 쏘아 올린 개국의 터전까지.
              제주특별자치도 공식 신화 삽화를 그림책처럼 한 장면씩 넘겨 읽고,
              이야기가 깃든 실제 유적과 AI 안내원으로 여행을 이어가 보세요.
            </p>

            <div className="myth-hero-actions">
              <a href="#myth-codex-stage" className="btn btn-citrus btn-lg">
                <i className="bi bi-book-half me-2" />신화 화첩 펼치기
              </a>
              <Link to="/explore" className="btn btn-primary btn-lg">
                <i className="bi bi-compass me-2" />이야기 탐험 도감
              </Link>
              <Link to="/agent" className="btn btn-outline-sea btn-lg">
                <i className="bi bi-stars me-2" />AI 신화 안내원
              </Link>
            </div>

            <div className="myth-hero-pillars" role="list" aria-label="핵심 탐험 원칙">
              <div className="myth-pillar-item" role="listitem">
                <span className="myth-pillar-num">01</span>
                <div>
                  <strong>원본 비율 신화 화첩</strong>
                  <span>제주특별자치도 공식 삽화·원문 보존</span>
                </div>
              </div>
              <div className="myth-pillar-item" role="listitem">
                <span className="myth-pillar-num">02</span>
                <div>
                  <strong>근거 확인 관광지 연결</strong>
                  <span>TourAPI·국가유산·역사문화 교차 검증</span>
                </div>
              </div>
              <div className="myth-pillar-item" role="listitem">
                <span className="myth-pillar-num">03</span>
                <div>
                  <strong>자율 도구 호출 AI</strong>
                  <span>신화·유적·날씨 API 실시간 조회</span>
                </div>
              </div>
            </div>
          </div>

          {heroScene?.image && (
            <div className="myth-hero-showcase">
              <div className="hero-codex-card">
                <div className="hero-codex-top">
                  <span className="hero-codex-chapter">
                    <i className="bi bi-journal-bookmark-fill me-1" />
                    {activeScene?.image ? selected.chapterLabel : fallbackMyth.chapterLabel}
                  </span>
                  <span className="hero-codex-dim">
                    원본 비율 {heroScene.image.width}×{heroScene.image.height}
                  </span>
                </div>

                <div className="hero-codex-mat" key={`hero-img-${heroScene.id}`}>
                  <img
                    src={heroScene.image.src}
                    alt={heroScene.image.alt}
                    width={heroScene.image.width}
                    height={heroScene.image.height}
                  />
                </div>

                <div className="hero-codex-caption">
                  <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2">
                    <strong className="font-myth fs-5 text-forest">{heroMythTitle}</strong>
                    <span className="hero-codex-scene-name">{heroScene.caption}</span>
                  </div>
                  <div className="hero-codex-quick-switch mt-2" role="group" aria-label="대표 화첩 빠른 전환">
                    {myths.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`hero-switch-chip${m.id === selectedId ? ' is-active' : ''}`}
                        onClick={() => handleSelectMyth(m.id)}
                      >
                        {m.title}
                      </button>
                    ))}
                  </div>
                  <SourceCredit source={MYTH_SOURCE} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. 대표 신화 3선 챕터 선택 (그림책 목차 카드) */}
      <section aria-labelledby="myth-select" className="mt-5 pt-2">
        <div className="section-head-bar mb-3">
          <div>
            <p className="section-eyebrow mb-1">CHAPTER INDEX · 대표 이야기 3선</p>
            <h2 id="myth-select" className="h3 font-myth mb-1">어떤 신화의 책장부터 열어볼까요?</h2>
            <p className="text-muted small mb-0">
              이야기 카드를 선택하면 아래 화첩 스테이지에서 원본 삽화 장면과 실제 제주 유적 정보가 함께 펼쳐집니다.
            </p>
          </div>
          <Link to="/explore" className="btn btn-outline-sea">
            <i className="bi bi-compass me-1" />전체 이야기 도감 보기
          </Link>
        </div>

        <Row className="g-4">
          {myths.map((m) => (
            <Col key={m.id} xs={12} md={4}>
              <MythCard
                myth={m}
                selected={m.id === selectedId}
                onSelect={handleSelectMyth}
              />
            </Col>
          ))}
        </Row>
      </section>

      {/* 3. 펼침면 신화 화첩 & 실제 제주 유적 연결 스테이지 */}
      <section
        id="myth-codex-stage"
        className="mt-5 pt-2"
        aria-live="polite"
        aria-label="선택한 이야기 화첩"
      >
        <div className="section-head-bar mb-3">
          <div>
            <p className="section-eyebrow mb-1">OPEN CODEX & PLACE BRIDGE · 화첩 열람과 현장 연결</p>
            <h2 className="h4 font-myth mb-0">
              {selected.chapterLabel} — {selected.title}
            </h2>
          </div>
          <span className="stage-place-indicator">
            <i className="bi bi-geo-alt-fill me-1" />
            연결 장소: <strong>{selected.place}</strong>
          </span>
        </div>

        <StoryPanel
          title={selected.title}
          subtitle={selected.subtitle}
          chapterLabel={selected.chapterLabel}
          scene={selected.scenes?.[sceneIndex]}
          scenes={selected.scenes}
          source={selected.source || MYTH_SOURCE}
          preview={selected.preview}
          sceneIndex={sceneIndex}
          sceneCount={selected.scenes?.length ?? 0}
          onSceneChange={setSceneIndex}
          emptyStoryNote={selected.emptyStoryNote}
          placeBridge={selected.placeBridge}
        />
      </section>

      {/* 4. 신화 탐험 여정 안내 (내부 화면 연결 브리지) */}
      <section className="myth-journey-strip mt-5" aria-label="제주 신화 탐험 여정">
        <div className="row g-3 align-items-stretch">
          <div className="col-12 col-md-4">
            <div className="journey-step-card h-100">
              <span className="journey-step-badge">STEP 01 · 이야기 도감</span>
              <h3 className="h5 font-myth mt-2">검증된 제주 신화·전설 탐색</h3>
              <p className="small text-muted mb-3">
                설문대할망·탐라 삼신인을 비롯해 공공데이터 출처가 확인된 이야기를 검색하고 장면별로 감상합니다.
              </p>
              <Link to="/explore" className="btn btn-outline-sea btn-sm mt-auto">
                이야기 탐험하기 <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="journey-step-card h-100">
              <span className="journey-step-badge">STEP 02 · 유적과 관광지</span>
              <h3 className="h5 font-myth mt-2">실제 공공 API 장소·유산 조회</h3>
              <p className="small text-muted mb-3">
                삼성혈·혼인지·산방산·수월봉 등 이야기가 깃든 현장을 한국관광공사 TourAPI와 국가유산청 데이터로 확인합니다.
              </p>
              <div className="d-flex flex-wrap gap-2 mt-auto">
                <Link to="/places" className="btn btn-outline-sea btn-sm">
                  관광·문화 조회
                </Link>
                <Link to="/heritage" className="btn btn-outline-sea btn-sm">
                  국가유산 조회
                </Link>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="journey-step-card is-highlight h-100">
              <span className="journey-step-badge">STEP 03 · AI 신화 안내원</span>
              <h3 className="h5 font-myth mt-2">스스로 도구를 고르는 AI 가이드</h3>
              <p className="small text-muted mb-3">
                질문에 맞춰 신화·역사문화·관광지·기상청 도구를 직접 호출하고, 호출 기록과 출처를 투명하게 보여줍니다.
              </p>
              <Link to="/agent" className="btn btn-citrus btn-sm mt-auto">
                <i className="bi bi-stars me-1" />AI 안내원에게 질문하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
