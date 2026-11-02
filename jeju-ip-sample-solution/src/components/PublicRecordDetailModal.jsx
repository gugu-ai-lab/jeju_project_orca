import { useState } from 'react'
import { Alert, Button, Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import VerifiedLocationMap from './VerifiedLocationMap'
import { readVerifiedCoordinates } from '../lib/coordinates'

const TOUR_INFO_URL = 'https://www.data.go.kr/data/15101578/openapi.do'
function formatDesignationDate(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length === 8 ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}` : value
}
function Photo({ src, title }) {
  const [failedSrc, setFailedSrc] = useState(null)
  if (!src || failedSrc === src) return <div className="record-detail-photo-placeholder" role="img" aria-label={`${title} · 확인된 사진이 없습니다`}><span aria-hidden="true">🌿</span><span>확인된 사진이 없습니다</span></div>
  return <img className="record-detail-photo" src={src} alt={title} onError={() => setFailedSrc(src)} />
}

export default function PublicRecordDetailModal({ type, record, detail, loading, error, relatedStory, onClose }) {
  const heritage = type === 'heritage'
  if (!record) return null

  const title = heritage ? detail?.name || record.name : detail?.title || record.title
  const description = detail?.description || record.description || ''
  const address = heritage ? detail?.address || record.city : detail?.addr || record.addr
  const latitude = heritage ? record.lat : detail?.lat || record.lat
  const longitude = heritage ? record.lng : detail?.lng || record.lng
  const coords = readVerifiedCoordinates(latitude, longitude)
  const photo = heritage ? record.image : detail?.image || record.image
  const photoSource = heritage ? record.imageSource : detail?.imageSource
  const photoLicense = heritage ? record.imageLicense : null
  const infoSource = heritage ? detail?.source || '국가유산청 국가유산포털' : detail?.source || '한국관광공사 TourAPI'
  const infoSourceUrl = heritage
    ? `https://www.khs.go.kr/cha/SearchKindOpenapiDt.do?${new URLSearchParams(record.detailKey || {})}`
    : TOUR_INFO_URL
  const directionUrl = coords ? `https://map.kakao.com/link/to/${encodeURIComponent(title)},${coords.lat},${coords.lng}` : null

  return (
    <Modal show centered scrollable fullscreen="md-down" size="lg" onHide={onClose} aria-labelledby="public-record-detail-title">
      <Modal.Header closeButton>
        <Modal.Title id="public-record-detail-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <p className="small text-secondary" role="status">상세 정보를 불러오고 있어요.</p>}
        {error && <Alert variant="warning" role="alert">상세 설명을 불러오지 못했어요. 목록에서 확인한 기본 정보는 계속 볼 수 있어요.</Alert>}
        <Photo src={photo} title={title} />
        {photo && <div className="small text-secondary mt-2">
          {heritage ? <>{record.imageCaption && <span>{record.imageCaption} · </span>}
            사진: <a href={record.imageSourceUrl} target="_blank" rel="noopener noreferrer">{photoSource}</a>
            {' · '}<a href={record.imageLicenseUrl} target="_blank" rel="noopener noreferrer">{photoLicense}</a>
          </> : <a href={TOUR_INFO_URL} target="_blank" rel="noopener noreferrer">사진·관광정보 출처: {photoSource || '한국관광공사 TourAPI'}</a>}
        </div>}

        <div className="record-detail-fields mt-3">
          <p><strong>{heritage ? '종목' : '분류'}:</strong> {heritage ? detail?.kind || record.kind || '정보 없음' : record.type === '14' ? '문화시설' : record.type === '15' ? '축제·행사' : '관광지'}</p>
          {heritage && detail?.province && <p><strong>소재 지역:</strong> {detail.province} {detail.city}</p>}
          {address && <p><strong>주소:</strong> {address}</p>}
          {heritage && detail?.designationDate && <p><strong>지정일:</strong> {formatDesignationDate(detail.designationDate)}</p>}
          {heritage && detail?.quantity && <p><strong>수량:</strong> {detail.quantity}</p>}
          {heritage && detail?.period && <p><strong>시대:</strong> {detail.period}</p>}
          {heritage && detail?.administrator && <p><strong>관리:</strong> {detail.administrator}</p>}
          {!heritage && detail?.phone && <p><strong>전화:</strong> {detail.phone}</p>}
          <p className="small text-secondary mb-0">정보 출처: <a href={infoSourceUrl} target="_blank" rel="noopener noreferrer">{infoSource}</a></p>
        </div>

        <section className="record-detail-description mt-3" aria-label={heritage ? '역사 설명' : '관광지 소개'}>
          <h3 className="h6">{heritage ? '역사 설명' : '소개'}</h3>
          <p className="mb-0">{description || (loading ? '공식 소개를 확인하고 있어요.' : '공식 상세 소개가 제공되지 않았어요.')}</p>
        </section>

        {coords && <>
          <VerifiedLocationMap key={`${title}:${coords.lat}:${coords.lng}`} title={title} latitude={latitude} longitude={longitude} source={infoSource} />
          <p className="small text-secondary mt-1">위도 {coords.lat.toFixed(6)} · 경도 {coords.lng.toFixed(6)}</p>
          {directionUrl && <a className="btn btn-outline-sea btn-sm btn-round" href={directionUrl} target="_blank" rel="noopener noreferrer">카카오맵 길찾기</a>}
        </>}

        {relatedStory && <div className="mt-3"><Link className="btn btn-primary btn-sm btn-round" to={`/explore/${relatedStory.id}`} onClick={onClose}>관련 이야기 보기 · {relatedStory.title}</Link></div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>목록으로 돌아가기</Button>
      </Modal.Footer>
    </Modal>
  )
}
