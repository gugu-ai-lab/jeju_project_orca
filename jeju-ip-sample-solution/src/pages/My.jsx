import { useEffect, useState } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ItemCard from '../components/ItemCard'
import { Empty, Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'
import { STORY_CATALOG } from '../data/storyCatalog'
import { fetchHeritage, fetchTourDetail } from '../api/client'
import { buildFavoriteMedia } from '../lib/favorite-media'
export default function My() {
  const { favorites, favLoading, favError, loadFavorites, removeFavorite } = useAppStore()
  const [favoriteMedia, setFavoriteMedia] = useState({})
  useEffect(() => { loadFavorites() }, [loadFavorites])
  useEffect(() => {
    let active = true
    async function loadPlaceImages() {
      const tourFavorites = favorites.filter(favorite => favorite.storyId.startsWith('tour:'))
      const hasHeritageFavorites = favorites.some(favorite => favorite.storyId.startsWith('heritage:'))
      const [tourResults, heritageResult] = await Promise.all([
        Promise.all(tourFavorites.map(async favorite => {
          const contentId = favorite.storyId.slice('tour:'.length)
          if (!/^\d{1,20}$/.test(contentId)) return [contentId, null]
          try { return [contentId, await fetchTourDetail(contentId)] }
          catch { return [contentId, null] }
        })),
        hasHeritageFavorites ? fetchHeritage('', 1, 9).catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
      ])
      if (!active) return
      setFavoriteMedia(buildFavoriteMedia(favorites, {
        stories: STORY_CATALOG,
        tourDetails: Object.fromEntries(tourResults.filter(([, detail]) => detail)),
        heritageRecords: heritageResult.items || [],
      }))
    }
    if (favorites.length) loadPlaceImages()
    return () => { active = false }
  }, [favorites])
  return <>
    <PageHeader icon="star" title="내 즐겨찾기" subtitle="이 브라우저에서 저장한 이야기와 장소를 다시 만나보세요" />
    <p className="text-secondary small">익명 인증으로 나의 기록만 저장합니다. 브라우저 데이터를 지우면 기존 기록에 다시 접근하지 못할 수 있어요.</p>
    {favError && <Alert variant="warning" role="alert">{favError}</Alert>}
    {favLoading ? <Loading /> : favorites.length === 0 ? <Empty text="아직 저장한 항목이 없어요" /> :
      <Row xs={1} sm={2} lg={3} className="g-3">{favorites.map(f => {
        const media = favoriteMedia[f.storyId]
        return <Col key={f.id}>
        <ItemCard title={f.storyTitle} image={media?.image} isFavorite badge={f.storyId.startsWith('tour:') || f.storyId.startsWith('heritage:') ? '장소' : '이야기'}
          subtitle={<>
            <span>{new Date(f.createdAt).toLocaleString('ko-KR')}</span>
            {media?.imageCaption && <div className="mt-1">{media.imageCaption}</div>}
            {media?.imageSource && <div className="mt-1">사진: {media.imageSourceUrl
              ? <a href={media.imageSourceUrl} target="_blank" rel="noopener noreferrer">{media.imageSource}</a>
              : media.imageSource}</div>}
            {media?.imageLicense && <div>이용 조건: <a href={media.imageLicenseUrl} target="_blank" rel="noopener noreferrer">{media.imageLicense}</a></div>}
          </>} />
        {STORY_CATALOG.some(story => story.id === f.storyId) && <Link className="btn btn-link btn-sm" to={`/explore/${encodeURIComponent(f.storyId)}`}>이야기 보기</Link>}
        <Button size="sm" variant="outline-secondary" disabled={favLoading} onClick={() => removeFavorite(f.storyId)}>즐겨찾기 삭제</Button>
      </Col>
      })}</Row>}
  </>
}
