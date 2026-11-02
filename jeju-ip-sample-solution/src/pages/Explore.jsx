import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import StoryCard from '../components/StoryCard'
import StoryFilters from '../components/StoryFilters'
import { STORY_CATALOG } from '../data/storyCatalog'
import { filterStories, presentCategories } from '../lib/storyFilter'

// 제주 이야기 탐험 — 카탈로그를 검색·분류해서 본다. 기본은 출처가 확인된 이야기만 보여주고,
// 항목 수가 늘어나도 이 화면은 그대로 쓴다. 이야기를 고르면 /explore/:id 상세 화면으로 이동한다.
export default function Explore() {
  const [filters, setFilters] = useState({ query: '', category: 'all', onlyVerified: true, onlyWithImage: false })
  const navigate = useNavigate()

  const categories = useMemo(() => presentCategories(STORY_CATALOG), [])
  const shown = useMemo(() => filterStories(STORY_CATALOG, filters), [filters])

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
              <StoryCard story={s} selected={false} onSelect={(id) => navigate(`/explore/${id}`)} />
            </Col>
          ))}
        </Row>
      )}

    </>
  )
}
