import { Alert, Button } from 'react-bootstrap'
import { useAppStore } from '../store/useAppStore'
export default function StoryFavoriteButton({ storyId, storyTitle }) {
  const save = useAppStore(s => s.addFavorite)
  const busy = useAppStore(s => s.favLoading)
  const error = useAppStore(s => s.favError)
  return <div className="my-3">
    <Button variant="outline-primary" disabled={busy} onClick={() => save({ storyId, storyTitle })}>
      <i className="bi bi-star me-1" aria-hidden="true" />이야기 즐겨찾기
    </Button>
    {error && <Alert variant="warning" className="mt-2" role="alert">{error}</Alert>}
  </div>
}
