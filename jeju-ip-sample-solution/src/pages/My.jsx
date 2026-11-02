import { useEffect } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ItemCard from '../components/ItemCard'
import { Empty, Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'
import { STORY_CATALOG } from '../data/storyCatalog'
export default function My() {
  const { favorites, favLoading, favError, loadFavorites, removeFavorite } = useAppStore()
  useEffect(() => { loadFavorites() }, [loadFavorites])
  return <>
    <PageHeader icon="star" title="내 즐겨찾기" subtitle="이 브라우저에서 저장한 이야기와 장소를 다시 만나보세요" />
    <p className="text-secondary small">익명 인증으로 나의 기록만 저장합니다. 브라우저 데이터를 지우면 기존 기록에 다시 접근하지 못할 수 있어요.</p>
    {favError && <Alert variant="warning" role="alert">{favError}</Alert>}
    {favLoading ? <Loading /> : favorites.length === 0 ? <Empty text="아직 저장한 항목이 없어요" /> :
      <Row xs={1} sm={2} lg={3} className="g-3">{favorites.map(f => <Col key={f.id}>
        <ItemCard title={f.storyTitle} badge={f.storyId.startsWith('tour:') || f.storyId.startsWith('heritage:') ? '장소' : '이야기'}
          subtitle={new Date(f.createdAt).toLocaleString('ko-KR')} />
        {STORY_CATALOG.some(story => story.id === f.storyId) && <Link className="btn btn-link btn-sm" to={`/explore/${encodeURIComponent(f.storyId)}`}>이야기 보기</Link>}
        <Button size="sm" variant="outline-secondary" disabled={favLoading} onClick={() => removeFavorite(f.storyId)}>즐겨찾기 삭제</Button>
      </Col>)}</Row>}
  </>
}
