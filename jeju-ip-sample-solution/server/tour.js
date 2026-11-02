// 한국관광공사 국문 관광정보 서비스_GW. 서버 전용.
import { XMLParser } from 'fast-xml-parser'
const BASE = 'https://apis.data.go.kr/B551011/KorService2'
const SOURCE = '한국관광공사 TourAPI'
const parser = new XMLParser({ parseTagValue: false })
const authCodes = new Set(['20', '21', '22', '30', '31', '32', '33', 'SERVICE_KEY_IS_NULL', 'SERVICE_KEY_IS_NOT_REGISTERED_ERROR', 'SERVICE_ACCESS_DENIED_ERROR'])
function fail(message, httpStatus, code) {
  const error = new Error(message)
  error.httpStatus = Number.isInteger(httpStatus) ? httpStatus : undefined
  const key = process.env.DATA_GO_KR_KEY?.trim()
  const safe = !key || (!String(code).includes(key) && !String(code).includes(encodeURIComponent(key)))
  error.upstreamCode = safe && /^[A-Za-z0-9_-]{1,64}$/.test(String(code)) ? String(code) : 'UNKNOWN'
  return error
}
function plain(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
}
async function requestTour(operation, extra) {
  const key = process.env.DATA_GO_KR_KEY?.trim()
  if (!key) throw new Error('DATA_KEY_MISSING')
  const params = new URLSearchParams({ serviceKey: key, MobileOS: 'ETC', MobileApp: 'JejuMyth', _type: 'json', pageNo: '1', ...extra })
  let response
  try { response = await fetch(BASE + '/' + operation + '?' + params, { signal: AbortSignal.timeout(12000) }) }
  catch { throw fail('TOUR_UPSTREAM_ERROR', undefined, 'NETWORK_ERROR') }
  let data
  const text = await response.text()
  try { data = JSON.parse(text) } catch {
    try { data = parser.parse(text) } catch { throw fail('TOUR_UPSTREAM_ERROR', response.status, 'INVALID_RESPONSE') }
  }
  const header = data?.response?.header
  const gateway = data?.OpenAPI_ServiceResponse?.cmmMsgHeader || data?.cmmMsgHeader
  const code = String(header?.resultCode ?? gateway?.returnReasonCode ?? gateway?.errMsg ?? 'UNKNOWN')
  if (!response.ok || !['0000', '00'].includes(code)) {
    throw fail([401, 403].includes(response.status) || authCodes.has(code) ? 'TOUR_AUTH_ERROR' : 'TOUR_UPSTREAM_ERROR', response.status, code)
  }
  const item = data.response?.body?.items?.item
  return { items: !item ? [] : Array.isArray(item) ? item : [item], totalCount: Number(data.response?.body?.totalCount || 0) }
}
function normalize(p) {
  return {
    id: String(p.contentid), title: plain(p.title), addr: plain([p.addr1, p.addr2].filter(Boolean).join(' ')),
    image: p.firstimage || '', lng: p.mapx || '', lat: p.mapy || '', type: p.contenttypeid,
    description: plain(p.overview), source: SOURCE,
  }
}
// 기존 Places 화면이 사용하는 배열 형식을 유지한다.
export async function searchTour({ keyword = '', contentTypeId = '12', rows = 10 } = {}) {
  if (typeof keyword !== 'string' || keyword.length > 80 || !['12', '14', '15'].includes(String(contentTypeId))) throw new Error('INVALID_TOOL_INPUT')
  keyword = keyword.trim()
  const params = { numOfRows: String(Math.max(1, Math.min(Number(rows) || 10, 10))), lDongRegnCd: '50', contentTypeId: String(contentTypeId) }
  if (keyword) params.keyword = keyword
  const result = await requestTour(keyword ? 'searchKeyword2' : 'areaBasedList2', params)
  return result.items.map(normalize)
}
// AI와 직접 조회가 공유한다. 상세 호출은 상위 3건으로 제한한다.
export async function getTourDetail({ contentId } = {}) {
  if (typeof contentId !== 'string' || !/^\d{1,20}$/.test(contentId)) throw new Error('INVALID_TOOL_INPUT')
  const result = await requestTour('detailCommon2', { contentId, numOfRows: '1' })
  const place = result.items[0]
  if (!place) return null
  return {
    ...normalize(place),
    description: plain(place.overview),
    phone: plain(place.tel),
    source: SOURCE,
    imageSource: place.firstimage ? SOURCE : undefined,
  }
}

export async function searchTourPlaces({ keyword }) {
  const records = (await searchTour({ keyword, rows: 3 })).slice(0, 3)
  const items = await Promise.all(records.map(async p => {
    try {
      const detail = await requestTour('detailCommon2', { contentId: p.id, numOfRows: '1' })
      const normalized = detail.items[0] ? normalize(detail.items[0]) : p
      return { id: p.id, title: normalized.title || p.title, address: normalized.addr || p.addr,
        latitude: normalized.lat || p.lat, longitude: normalized.lng || p.lng,
        description: normalized.description.slice(0, 1600), source: SOURCE,
        detailStatus: detail.items.length ? 'success' : 'empty' }
    } catch (error) {
      return { id: p.id, title: p.title, address: p.addr, latitude: p.lat, longitude: p.lng,
        description: '', source: SOURCE, detailStatus: 'error', upstreamCode: error.upstreamCode, httpStatus: error.httpStatus }
    }
  }))
  return { source: SOURCE, count: items.length, items, complete: items.every(p => p.detailStatus === 'success'), fetchedAt: new Date().toISOString() }
}
