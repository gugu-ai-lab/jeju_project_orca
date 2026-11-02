import { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import MythCard from '../components/MythCard'
import StoryPanel from '../components/StoryPanel'
import { MYTH_PREVIEW } from '../data/mythPreview'

export default function Home() {
  const myths = MYTH_PREVIEW.map((m) => ({ ...m, preview: true }))
  const [selectedId, setSelectedId] = useState(myths[0].id)
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
              <MythCard myth={m} selected={m.id === selectedId} onSelect={setSelectedId} />
            </Col>
          ))}
        </Row>
      </section>

      <section className="mt-4" aria-live="polite" aria-label="선택한 이야기">
        <StoryPanel title={selected.title} scene={selected.scenes?.[0]} source={selected.source} preview={selected.preview} />
      </section>
    </>
  )
}
