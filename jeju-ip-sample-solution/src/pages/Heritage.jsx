import { useEffect, useRef, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ItemCard from '../components/ItemCard'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchHeritage, fetchHeritageDetail } from '../api/client'
import PublicRecordDetailModal from '../components/PublicRecordDetailModal'
import mapPinsData from '../data/jejuMapPins.json' with { type: 'json' }
import { STORY_CATALOG } from '../data/storyCatalog'
import { useAppStore } from '../store/useAppStore'

export default function Heritage() {
  const addFavorite = useAppStore((s) => s.addFavorite)
  const [keyword, setKeyword] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedHeritage, setSelectedHeritage] = useState(null)
  const [heritageDetail, setHeritageDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const detailRequest = useRef(0)

  async function search(e) {
    e?.preventDefault()
    setLoading(true); setError('')
    try { setList(await fetchHeritage(keyword)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { search() }, [])

  async function openDetail(heritage) {
    const requestId = ++detailRequest.current
    setSelectedHeritage(heritage); setHeritageDetail(null); setDetailError(''); setDetailLoading(true)
    try {
      const detail = await fetchHeritageDetail(heritage.detailKey)
      if (requestId === detailRequest.current) {
        if (!detail) throw new Error('상세 정보가 없습니다.')
        setHeritageDetail(detail)
      }
    } catch (err) { if (requestId === detailRequest.current) setDetailError(err.message) }
    finally { if (requestId === detailRequest.current) setDetailLoading(false) }
  }
  function closeDetail() {
    detailRequest.current++
    setSelectedHeritage(null); setHeritageDetail(null); setDetailError(''); setDetailLoading(false)
  }
  const normalizeName = value => String(value || '').replace(/\s+/g, '')
  const relatedPin = selectedHeritage && mapPinsData.find(pin => pin.hasVerifiedLocation && pin.location?.name && normalizeName(pin.location.name) === normalizeName(selectedHeritage.name))
  const relatedStory = relatedPin && STORY_CATALOG.find(story => story.id === relatedPin.mythId)

  return (
    <>
      <PageHeader icon="bank" title="국가유산" subtitle="국가유산청 국가유산 검색" />
      <Form onSubmit={search} className="mb-4">
        <InputGroup>
          <Form.Control value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 관덕정, 돌하르방" />
          <Button type="submit"><i className="bi bi-search" /></Button>
        </InputGroup>
      </Form>
      <ErrorAlert error={error} />
      {loading ? <Loading /> : list.length === 0 ? <Empty /> : (
        <Row xs={1} sm={2} lg={3} className="g-3">
          {list.map((h, i) => (
            <Col key={h.id || i}>
              <ItemCard title={h.name} image={h.image} subtitle={<>{h.city}{h.image && <>
                  <br />{h.imageCaption}<br />
                  <a href={h.imageSourceUrl} target="_blank" rel="noopener noreferrer">사진: {h.imageSource}</a>
                  {' · '}<a href={h.imageLicenseUrl} target="_blank" rel="noopener noreferrer">{h.imageLicense}</a>
                </>}</>} badge={h.kind} onOpen={() => openDetail(h)}
                onSave={() => addFavorite({ source: 'heritage', id: h.name, title: h.name })} />
            </Col>
          ))}
        </Row>
      )}
      <PublicRecordDetailModal type="heritage" record={selectedHeritage} detail={heritageDetail} loading={detailLoading} error={detailError} relatedStory={relatedStory} onClose={closeDetail} />
    </>
  )
}
