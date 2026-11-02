// 국가유산청 국가유산 검색 오픈API (키 불필요, XML 응답)
import { XMLParser } from 'fast-xml-parser'
// 유산번호의 선행 0을 보존해야 동일 유산의 사진을 조회할 수 있다.
const parser = new XMLParser({ parseTagValue: false })
const approved = new Map([
  ['1123903220000', '1623059'], // 제주 관덕정: 공식 사진 원문의 공공누리 1유형 확인
  ['1123911870000', '1623086'], // 제주 불탑사 오층석탑: 탑신 및 상륜부, 1유형 확인
])
const cache = new Map()
const array = value => value == null ? [] : Array.isArray(value) ? value : [value]
async function readXml(url, fetchImpl) {
  const r = await fetchImpl(url, { signal: AbortSignal.timeout(8000) })
  if (!r.ok) throw new Error('국가유산 정보를 조회하지 못했습니다.')
  return parser.parse(await r.text())?.result
}
async function approvedImage(h, fetchImpl) {
  const imageId = approved.get(h.ccbaCpno)
  if (!imageId) return {}
  const key = [h.ccbaKdcd, h.ccbaAsno, h.ccbaCtcd, imageId].join(':')
  if (fetchImpl === globalThis.fetch && cache.get(key)?.expires > Date.now()) return cache.get(key).value
  try {
    const params = new URLSearchParams({ ccbaKdcd: h.ccbaKdcd, ccbaAsno: h.ccbaAsno, ccbaCtcd: h.ccbaCtcd })
    const data = await readXml('https://www.khs.go.kr/cha/SearchImageOpenapi.do?' + params, fetchImpl)
    if (!data || ['ccbaKdcd', 'ccbaAsno', 'ccbaCtcd'].some(k => data[k] !== h[k])) return {}
    const item = data.item || {}
    const urls = array(item.imageUrl), licenses = array(item.imageNuri), captions = array(item.ccimDesc)
    const index = urls.findIndex((url, i) => {
      try {
        const u = new URL(url)
        return u.hostname === 'www.khs.go.kr' && ['http:', 'https:'].includes(u.protocol)
          && u.pathname === '/unisearch/images/treasure/' + imageId + '.jpg' && !u.search && !u.username && !u.password
          && licenses[i] === 'A/F'
      } catch { return false }
    })
    if (index < 0) return {}
    const image = new URL(urls[index]); image.protocol = 'https:'
    const value = { image: image.href, imageCaption: captions[index] || h.ccbaMnm1,
      imageSource: '국가유산청 국가유산포털', imageLicense: '공공누리 제1유형(출처표시)',
      imageLicenseUrl: 'https://www.kogl.or.kr/info/licenseType1.do',
      imageSourceUrl: 'https://www.heritage.go.kr/heri/cul/imgHeritage.do?' + new URLSearchParams({ ccimId: imageId, ...Object.fromEntries(params) }),
    }
    if (fetchImpl === globalThis.fetch) cache.set(key, { value, expires: Date.now() + 300000 })
    return value
  } catch { return {} } // 사진 API 장애가 검색 목록 전체를 실패시키지 않도록 한다.
}
export async function searchHeritage({ keyword = '', rows = 10, fetchImpl = globalThis.fetch } = {}) {
  const params = new URLSearchParams({ ccbaCtcd: '50', pageUnit: String(rows), pageIndex: '1' })
  if (keyword) params.set('ccbaMnm1', keyword)
  const data = await readXml('https://www.khs.go.kr/cha/SearchKindOpenapiList.do?' + params, fetchImpl)
  return Promise.all(array(data?.item).map(async h => ({
    name: h.ccbaMnm1, kind: h.ccmaName, city: h.ccsiName,
    lat: h.latitude == null ? undefined : Number(h.latitude), lng: h.longitude == null ? undefined : Number(h.longitude),
    ...await approvedImage(h, fetchImpl),
  })))
}
