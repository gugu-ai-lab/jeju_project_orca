import { useState } from 'react'
import { Badge, Button, Card } from 'react-bootstrap'

// 관광지·유산·즐겨찾기 등 목록에서 공통으로 사용하는 카드.
export default function ItemCard({ title, subtitle, image, badge, onSave, onOpen, isFavorite = false }) {
  const [failedImage, setFailedImage] = useState(null)
  const showImage = Boolean(image && image !== failedImage)
  function handleCardClick(event) {
    if (!onOpen || event.target.closest('button, a')) return
    onOpen()
  }
  function handleImageKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen?.() }
  }
  const imageContent = showImage
    ? <Card.Img variant="top" src={image} alt={title} className="item-card-img" onError={() => setFailedImage(image)} />
    : <div className="item-card-img placeholder-img d-flex flex-column align-items-center justify-content-center gap-1"
        role="img" aria-label={`${title} · 사진 준비 중 · 실제 사진이 아닙니다`}>
        <span aria-hidden="true">🌿</span><span className="small">사진 준비 중</span>
      </div>
  return (
    <Card className="h-100 item-card" onClick={onOpen ? handleCardClick : undefined}>
      {onOpen ? <button type="button" className="item-card-image-trigger" onClick={onOpen} onKeyDown={handleImageKeyDown} aria-label={`${title} 자세히 보기`}>{imageContent}</button> : imageContent}
      <Card.Body className="d-flex flex-column">
        {badge && <Badge bg="secondary" className="align-self-start mb-2">{badge}</Badge>}
        <Card.Title className="fs-6 fw-bold">{onOpen
          ? <button type="button" className="item-card-title-trigger" onClick={onOpen}>{title}<span className="visually-hidden"> 자세히 보기</span></button>
          : title}{isFavorite && <i className="bi bi-star-fill favorite-star ms-2" aria-label="즐겨찾기 저장됨" />}</Card.Title>
        {subtitle && <Card.Text className={`small text-muted${onOpen ? ' item-card-subtitle-trigger' : ''}`}>{subtitle}</Card.Text>}
        {onSave && (
          <Button size="sm" variant="outline-primary" className="mt-auto" onClick={onSave}>
            <i className="bi bi-star me-1" />즐겨찾기
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}
