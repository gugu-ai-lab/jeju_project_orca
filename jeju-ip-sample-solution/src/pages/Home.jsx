import { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import MythCard from '../components/MythCard'
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

      <section className="surface myth-detail mt-4 p-4" aria-live="polite">
        <span className="preview-badge">예시 데이터 · 미리보기</span>
        <h3 className="h5 mt-2 mb-1">{selected.title}</h3>
        <p className="text-secondary mb-3">연결 후보 장소: {selected.place} (설화와 장소의 연결은 출처 확인 전)</p>
        <div className="story-empty">
          <i className="bi bi-journal-text me-2" />
          이야기 본문은 제주신화정보 API 연결과 출처 검증 후 이곳에 표시됩니다.
        </div>
      </section>
    </>
  )
}
