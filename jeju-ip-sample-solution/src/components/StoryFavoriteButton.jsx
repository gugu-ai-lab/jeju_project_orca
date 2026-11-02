import { useEffect } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { useAppStore } from '../store/useAppStore'
export default function StoryFavoriteButton({ storyId, storyTitle }) {
  const toggleFavorite = useAppStore(s => s.toggleFavorite)
  const load = useAppStore(s => s.loadFavorites)
  const favorites = useAppStore(s => s.favorites)
  const busy = useAppStore(s => s.favLoading)
  const error = useAppStore(s => s.favError)
  const isSaved = favorites.some(item => item.storyId === storyId)

  useEffect(() => {
    if (import.meta.env?.VITE_INTEGRATION_READ_ONLY !== 'true') load()
  }, [load, storyId])

  return <div className="my-3">
    <Button variant="outline-primary" className={`story-favorite-button${isSaved ? ' is-saved' : ''}`} aria-pressed={isSaved} disabled={busy} onClick={() => toggleFavorite({ storyId, storyTitle })}>
      <i className={`bi ${isSaved ? 'bi-star-fill favorite-star' : 'bi-star'} me-1`} aria-hidden="true" />{isSaved ? '즐겨찾기 취소' : '이야기 즐겨찾기'}
    </Button>
    {error && <Alert variant="warning" className="mt-2" role="alert">{error}</Alert>}
  </div>
}
