import { searchTourPlaces } from './tour.js'
import { getWeather } from './weather.js'
import { searchStoryContent } from './story-search.js'
import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({ parseTagValue: false })
const cache = new Map()
const definitions = [
  ['search_story_content', '검증된 제주 신화·전설 이야기', '공통 이야기 목록에서 검증된 신화·전설의 줄거리, 인물, 장소 연결 내용을 검색한다. 이야기 질문에 우선 사용한다.'],
  ['search_myths', '제주신화정보', '제주 신화·전설 자료의 제목과 출처를 검색한다. 줄거리 제공 도구가 아니다.'],
  ['search_culture', '제주역사문화일반정보', '제주 역사문화 자료의 내용과 참고문헌을 검색한다.'],
  ['search_locations', '제주역사문화위치정보', '관련 장소의 위치와 좌표를 검색한다.'],
]
export const tools = definitions.map(([name, , description]) => ({
  name, description,
  input_schema: { type: 'object', properties: { keyword: { type: 'string', maxLength: 80 } }, required: ['keyword'], additionalProperties: false },
}))
tools.push({
  name: 'get_weather', description: '기상청 단기예보로 제주시 또는 서귀포시의 기온·하늘·강수확률을 조회한다. 예보 시각을 확인한다.',
  input_schema: { type: 'object', properties: { place: { type: 'string', enum: ['제주시', '서귀포시'] } }, required: ['place'], additionalProperties: false },
})
definitions.push(['get_weather', '기상청 단기예보'])
tools.push({
  name: 'search_tour_places',
  description: '한국관광공사 TourAPI로 제주 신화와 관련된 관광지 이름을 검색하고 주소·좌표·소개를 확인한다. 신화와의 관계 자체는 별도 근거로 확인한다.',
  input_schema: { type: 'object', properties: { keyword: { type: 'string', maxLength: 80 } }, required: ['keyword'], additionalProperties: false },
})
definitions.push(['search_tour_places', '한국관광공사 TourAPI'])
const sourceUrls = {
  search_myths: 'https://www.data.go.kr/data/15058603/openapi.do',
  search_culture: 'https://www.data.go.kr/data/15109587/fileData.do',
  search_locations: 'https://www.data.go.kr/data/15109570/fileData.do',
  get_weather: 'https://www.data.go.kr/data/15084084/openapi.do',
  search_tour_places: 'https://www.data.go.kr/data/15101578/openapi.do',
}
export function catalog() {
  return definitions.map(([name, source]) => ({
    name, source, sourceUrl: sourceUrls[name], configured: name === 'search_myths' || name === 'search_story_content' || Boolean(process.env.DATA_GO_KR_KEY?.trim()),
  }))
}
export function validateInput(input, name = 'search_myths') {
  if (name === 'get_weather') {
    if (!input || !['제주시', '서귀포시'].includes(input.place) || Object.keys(input).some(k => k !== 'place')) throw new Error('INVALID_TOOL_INPUT')
    return { place: input.place }
  }
  if (!input || typeof input.keyword !== 'string' || input.keyword.length > 80 || Object.keys(input).some(k => k !== 'keyword')) {
    throw new Error('INVALID_TOOL_INPUT')
  }
  return { keyword: input.keyword.trim() }
}
async function request(url, options = {}) {
  let response
  try { response = await fetch(url, { ...options, signal: AbortSignal.timeout(12000) }) }
  catch { throw new Error('UPSTREAM_UNAVAILABLE') }
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'DATA_AUTH_REQUIRED' : 'UPSTREAM_UNAVAILABLE')
  return response
}
async function load(name) {
  const saved = cache.get(name)
  if (saved && saved.expires > Date.now()) return saved.value
  let items, complete = true
  if (name === 'search_myths') {
    const response = await request('https://www.jeju.go.kr/tool/openapi/jejumythservice/jejumythlist?page=1&pageSize=200')
    const data = parser.parse(await response.text()).response
    if (data?.header?.resultCode !== '0000') throw new Error('UPSTREAM_UNAVAILABLE')
    const raw = data.body?.items?.item
    items = (raw ? (Array.isArray(raw) ? raw : [raw]) : []).map((p, i) => ({
      id: String(i), title: p.title, publisher: p.publisher, copyright: p.copyright,
      referenceUrl: p.dataImageUrl, source: '제주신화정보',
    }))
    complete = items.length >= Number(data.body.totalCount)
  } else {
    const key = process.env.DATA_GO_KR_KEY?.trim()
    if (!key) throw new Error('DATA_KEY_MISSING')
    const path = name === 'search_culture'
      ? '15109587/v1/uddi:56c2b3a4-4b4b-46cd-a1fa-f928ef731ffb'
      : '15109570/v1/uddi:8781448b-81a8-487c-bc95-d26335bafa82'
    const all = []
    // 상한까지 조회한 경우 부분 검색임을 반환한다.
    for (let page = 1; page <= 5; page++) {
      const response = await request('https://api.odcloud.kr/api/' + path + '?page=' + page + '&perPage=100',
        { headers: { Authorization: 'Infuser ' + key } })
      const data = await response.json()
      if (!Array.isArray(data.data)) throw new Error('UPSTREAM_UNAVAILABLE')
      all.push(...data.data)
      complete = all.length >= data.totalCount
      if (complete) break
    }
    items = all.map(p => ({
      id: String(p['데이터 고유번호']), title: p['제목'] || p['장소명'],
      place: p['장소명'], description: p['내용'] || p['초록'] || '',
      latitude: p['위도'], longitude: p['경도'], address: p['위치'],
      references: p['참고문헌'], referenceUrl: p['데이터 상세보기 URL'] || p['링크'],
      source: name === 'search_culture' ? '제주역사문화일반정보' : '제주역사문화위치정보',
    }))
  }
  const value = { items, complete, fetchedAt: new Date().toISOString() }
  cache.set(name, { value, expires: Date.now() + 5 * 60 * 1000 })
  return value
}
export const safeErrors = {
  INVALID_TOOL_INPUT: '검색어는 80자 이내, 날씨 지역은 제주시 또는 서귀포시로 선택해 주세요.',
  UNKNOWN_TOOL: '지원하지 않는 도구입니다.',
  DATA_KEY_MISSING: '공공데이터 인증 설정을 기다리고 있습니다.',
  DATA_AUTH_REQUIRED: '공공데이터 인증 설정을 확인해 주세요.',
  TOUR_AUTH_ERROR: 'TourAPI 인증 또는 서비스 활용 권한을 확인해 주세요.',
  TOUR_UPSTREAM_ERROR: 'TourAPI 응답을 받지 못했습니다. 다른 도구는 계속 이용할 수 있습니다.',
  UPSTREAM_UNAVAILABLE: '공공데이터 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.',
}
export async function executeTool(name, input) {
  if (!tools.some(t => t.name === name)) throw new Error('UNKNOWN_TOOL')
  const args = validateInput(input, name)
  if (name === 'search_story_content') {
    const items = searchStoryContent(args.keyword)
    return { source: '검증된 제주 신화·전설 이야기', items, count: items.length, complete: true, fetchedAt: new Date().toISOString() }
  }
  if (name === 'search_tour_places') return searchTourPlaces(args)
  if (name === 'get_weather') {
    const items = await getWeather(args)
    return { source: '기상청 단기예보', items, count: items.length, complete: true, fetchedAt: new Date().toISOString() }
  }
  const { keyword } = args
  const data = await load(name)
  const matches = data.items.filter(p => !keyword || [p.title, p.place, p.description].some(v => String(v || '').includes(keyword)))
  return { source: catalog().find(t => t.name === name).source, items: matches.slice(0, 10).map(p => ({ ...p, description: p.description?.slice(0, 1200) })),
    count: Math.min(matches.length, 10), matchedCount: matches.length, complete: data.complete, fetchedAt: data.fetchedAt }
}
