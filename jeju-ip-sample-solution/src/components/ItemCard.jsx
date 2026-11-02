import { useState } from 'react'
import { Badge, Button, Card } from 'react-bootstrap'

// 관광지·유산·즐겨찾기 등 "목록의 한 칸"을 모두 이 카드 하나로 표시합니다 (재사용 컴포넌트)
export default function ItemCard({ title, subtitle, image, badge, onSave }) {
  const [failedImage, setFailedImage] = useState(null)
  const showImage = Boolean(image && image !== failedImage)
  return (
    <Card className="h-100 item-card">
      {showImage
        ? <Card.Img variant="top" src={image} alt={title} className="item-card-img" onError={() => setFailedImage(image)} />
        : <div className="item-card-img placeholder-img d-flex flex-column align-items-center justify-content-center gap-1"
            role="img" aria-label={`${title} · 사진 준비 중 · 실제 사진이 아닙니다`}>
            <span aria-hidden="true">🌿</span><span className="small">사진 준비 중</span>
          </div>}
      <Card.Body className="d-flex flex-column">
        {badge && <Badge bg="secondary" className="align-self-start mb-2">{badge}</Badge>}
        <Card.Title className="fs-6 fw-bold">{title}</Card.Title>
        {subtitle && <Card.Text className="small text-muted">{subtitle}</Card.Text>}
        {onSave && (
          <Button size="sm" variant="outline-primary" className="mt-auto" onClick={onSave}>
            <i className="bi bi-star me-1" />즐겨찾기
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}
