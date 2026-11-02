import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import MythCard from '../components/MythCard'
import StoryPanel from '../components/StoryPanel'
import { MYTH_PREVIEW } from '../data/mythPreview'
import { MYTH_SCENES, MYTH_SOURCE } from '../data/mythStories'

export default function Home() {
  // 공식 자료가 있는 신화는 실제 자료로, 없는 신화만 예시(preview)로 표시
  const myths = MYTH_PREVIEW.map((m) => {
    const scenes = MYTH_SCENES[m.id]
    return { ...m, scenes, thumb: scenes?.[0]?.image, source: scenes ? MYTH_SOURCE : undefined, preview: !scenes }
  })
  const [selectedId, setSelectedId] = useState(myths[0].id)
  const [sceneIndex, setSceneIndex] = useState(0)
  const selected = myths.find((m) => m.id === selectedId)

  return (
    <>
      <section className="myth-hero">
        <p className="section-eyebrow mb-2">제주 신화·전설 탐험</p>
        <h1 className="display-6 fw-bold">이야기를 따라 걷다 보면, 제주의 장소가 말을 겁니다</h1>
        <p className="lead mb-0">신화와 전설을 고르고, 안내원에게 묻고, 이야기가 깃든 실제 관광지로 떠나 보세요.</p>
      </section>

      <section aria-labelledby="myth-select" className="mt-5">
        <h2 id="myth-select" className="h4 mb-3">어떤 이야기부터 만나볼까요?</h2>
        <Row className="g-3">
          {myths.map((m) => (
            <Col key={m.id} xs={12} md={4}>
              <MythCard myth={m} selected={m.id === selectedId} onSelect={(id) => { setSelectedId(id); setSceneIndex(0) }} />
            </Col>
          ))}
        </Row>
        <div className="mt-3">
          <Link to="/explore" className="btn btn-outline-sea"><i className="bi bi-compass me-1" />제주 이야기 탐험하기</Link>
        </div>
      </section>

      <section className="mt-4" aria-live="polite" aria-label="선택한 이야기">
        <StoryPanel title={selected.title} scene={selected.scenes?.[sceneIndex]} source={selected.source} preview={selected.preview}
          sceneIndex={sceneIndex} sceneCount={selected.scenes?.length ?? 0} onSceneChange={setSceneIndex} />
      </section>
    </>
  )
}
