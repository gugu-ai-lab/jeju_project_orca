import { useEffect, useRef, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ItemCard from '../components/ItemCard'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchPlaces, fetchTourDetail } from '../api/client'
import PublicRecordDetailModal from '../components/PublicRecordDetailModal'
import mapPinsData from '../data/jejuMapPins.json' with { type: 'json' }
import { STORY_CATALOG } from '../data/storyCatalog'
import { useAppStore } from '../store/useAppStore'

const TYPES = { 12: '관광지', 14: '문화시설', 15: '축제·행사' }

export default function Places() {
  const addFavorite = useAppStore((s) => s.addFavorite)   // STEP 5에서 사용
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('')
  const [places, setPlaces] = useState([])               // ① 데이터
  const [loading, setLoading] = useState(true)           // ② 로딩
  const [error, setError] = useState('')                 // ③ 에러
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [placeDetail, setPlaceDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const detailRequest = useRef(0)

  async function search(e) {
    e?.preventDefault()                                  // 폼 제출 시 새로고침 막기
    setLoading(true); setError('')
    try { setPlaces(await fetchPlaces(keyword, type)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { search() }, [])                      // 처음 한 번 자동 검색

  async function openDetail(place) {
    const requestId = ++detailRequest.current
    setSelectedPlace(place); setPlaceDetail(null); setDetailError(''); setDetailLoading(true)
    try {
      const detail = await fetchTourDetail(place.id)
      if (requestId === detailRequest.current) {
        if (!detail) throw new Error('상세 정보가 없습니다.')
        setPlaceDetail(detail)
      }
    } catch (err) { if (requestId === detailRequest.current) setDetailError(err.message) }
    finally { if (requestId === detailRequest.current) setDetailLoading(false) }
  }
  function closeDetail() {
    detailRequest.current++
    setSelectedPlace(null); setPlaceDetail(null); setDetailError(''); setDetailLoading(false)
  }
  const relatedPin = selectedPlace && mapPinsData.find(pin => pin.hasVerifiedLocation && String(pin.location?.recordId) === String(selectedPlace.id))
  const relatedStory = relatedPin && STORY_CATALOG.find(story => story.id === relatedPin.mythId)

  return (
    <>
      <PageHeader icon="geo-alt" title="관광·문화" subtitle="제주 전체 관광·문화 정보" />
      <Form onSubmit={search} className="mb-4">
        <InputGroup>
          <Form.Select value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 140 }}>
            <option value="">전체</option>
            {Object.entries(TYPES).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </Form.Select>
          <Form.Control value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="검색어 (선택)" />
          <Button type="submit"><i className="bi bi-search" /></Button>
        </InputGroup>
      </Form>

      <ErrorAlert error={error} />
      {loading ? <Loading /> : places.length === 0 ? <Empty /> : (
        <Row xs={1} sm={2} lg={3} className="g-3">
          {places.map((p) => (
            <Col key={p.id}>
              <ItemCard title={p.title} subtitle={p.addr} image={p.image} badge={TYPES[p.type]} onOpen={() => openDetail(p)}
                onSave={() => addFavorite({ source: 'tour', id: p.id, title: p.title })} />
            </Col>
          ))}
        </Row>
      )}
      <PublicRecordDetailModal type="tour" record={selectedPlace} detail={placeDetail} loading={detailLoading} error={detailError} relatedStory={relatedStory} onClose={closeDetail} />
    </>
  )
}
