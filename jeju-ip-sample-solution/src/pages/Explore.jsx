import { useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import StoryCard from '../components/StoryCard'
import StoryFilters from '../components/StoryFilters'
import StoryPanel from '../components/StoryPanel'
import { STORY_CATALOG } from '../data/storyCatalog'
import { filterStories, presentCategories } from '../lib/storyFilter'

// 제주 이야기 탐험 — 카탈로그 전체를 검색·분류해서 본다. 항목 수가 늘어나도 이 화면은 그대로 쓴다.
export default function Explore() {
  const [filters, setFilters] = useState({ query: '', category: 'all', onlyVerified: false, onlyWithImage: false })
  const [selectedId, setSelectedId] = useState(null)
  const [sceneIndex, setSceneIndex] = useState(0)

  const categories = useMemo(() => presentCategories(STORY_CATALOG), [])
  const shown = useMemo(() => filterStories(STORY_CATALOG, filters), [filters])
  const selected = STORY_CATALOG.find((s) => s.id === selectedId)

  return (
    <>
      <PageHeader title="제주 이야기 탐험하기" subtitle="신화·전설·민담을 검색하고, 출처가 확인된 이야기부터 만나보세요" />
      <StoryFilters value={filters} onChange={setFilters} categories={categories} total={STORY_CATALOG.length} shown={shown.length} />

      {shown.length === 0 ? (
        <div className="story-empty mt-3"><i className="bi bi-search me-2" />조건에 맞는 이야기가 없습니다. 검색어나 필터를 바꿔 보세요.</div>
      ) : (
        <Row className="g-3 mt-1">
          {shown.map((s) => (
            <Col key={s.id} xs={12} sm={6} lg={4}>
              <StoryCard story={s} selected={s.id === selectedId} onSelect={(id) => { setSelectedId(id); setSceneIndex(0) }} />
            </Col>
          ))}
        </Row>
      )}

      {selected && (
        <section className="mt-4" aria-live="polite" aria-label="선택한 이야기">
          <StoryPanel title={selected.title} scene={selected.scenes[sceneIndex]} source={selected.source}
            sceneIndex={sceneIndex} sceneCount={selected.scenes.length} onSceneChange={setSceneIndex} />
        </section>
      )}
    </>
  )
}
