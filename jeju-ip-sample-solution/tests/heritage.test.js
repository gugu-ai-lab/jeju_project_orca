import test from 'node:test'
import assert from 'node:assert/strict'
import { getHeritageDetail, searchHeritage, searchHeritagePage } from '../server/heritage.js'
const item = '<ccbaCpno>1123903220000</ccbaCpno><ccbaKdcd>12</ccbaKdcd><ccbaAsno>0003220000000</ccbaAsno><ccbaCtcd>50</ccbaCtcd><ccbaMnm1>제주 관덕정</ccbaMnm1><latitude>33.5</latitude>'
const photo = license => '<ccbaKdcd>12</ccbaKdcd><ccbaAsno>0003220000000</ccbaAsno><ccbaCtcd>50</ccbaCtcd><item><imageUrl>http://www.khs.go.kr/unisearch/images/treasure/1623059.jpg</imageUrl><imageNuri>' + license + '</imageNuri><ccimDesc>제주 관덕정 (촬영:문화재청)</ccimDesc></item>'
function mock(body, verify = () => {}) {
  return async url => { verify(new URL(url)); return new Response('<result>' + (url.includes('SearchImage') ? body : '<item>' + item + '</item>') + '</result>') }
}
test('approved photo keeps exact identifier, HTTPS, caption and attribution', async () => {
  const rows = await searchHeritage({ fetchImpl: mock(photo('A/F'), u => { if (u.pathname.includes('SearchImage')) assert.equal(u.searchParams.get('ccbaAsno'), '0003220000000') }) })
  assert.equal(rows[0].image, 'https://www.khs.go.kr/unisearch/images/treasure/1623059.jpg')
  assert.match(rows[0].imageLicense, /제1유형/)
  assert.match(rows[0].imageSourceUrl, /ccimId=1623059/)
  assert.equal(rows[0].lat, 33.5)
  assert.deepEqual(rows[0].detailKey, { ccbaKdcd: '12', ccbaAsno: '0003220000000', ccbaCtcd: '50' })
})
test('Jeju heritage list returns only photo-verified records with paginated totals', async () => {
  let requested
  const response = '<result><totalCnt>412</totalCnt><pageUnit>1000</pageUnit><pageIndex>1</pageIndex><item>' + item + '</item><item>' + item.replace('1123903220000', '1123999990000') + '</item></result>'
  const result = await searchHeritagePage({ pageNo: 2, rows: 9, fetchImpl: async url => {
    const urlObject = new URL(url)
    if (urlObject.pathname.includes('SearchImage')) {
      assert.equal(urlObject.searchParams.get('ccbaAsno'), '0003220000000')
      return new Response('<result>' + photo('A/F') + '</result>')
    }
    requested = urlObject
    return new Response(response)
  } })
  assert.equal(requested.searchParams.get('ccbaCtcd'), '50')
  assert.equal(requested.searchParams.get('ccbaCncl'), 'N')
  assert.equal(requested.searchParams.get('pageUnit'), '1000')
  assert.equal(requested.searchParams.get('pageIndex'), '1')
  assert.equal(result.totalCount, 1); assert.equal(result.page, 2); assert.equal(result.pageSize, 9)
  assert.equal(result.items.length, 0)
})
test('restricted license, different identifier and different photo never get linked', async () => {
  for (const body of [photo('D/F'), photo('A/F').replace('0003220000000', '0011870000000'), photo('A/F').replace('1623059.jpg', '1623060.jpg')]) {
    assert.equal((await searchHeritage({ fetchImpl: mock(body) })).length, 0)
  }
})
test('photo outage preserves search result; unreviewed items need no photo requests', async () => {
  const rows = await searchHeritage({ fetchImpl: async url => { if (url.includes('SearchImage')) throw new Error('offline'); return new Response('<result><item>' + item + '</item></result>') } })
  assert.equal(rows.length, 0)
  let calls = 0
  const unknown = await searchHeritage({ fetchImpl: async () => { calls++; return new Response('<result><item>' + item.replace('1123903220000', '1123905470200') + '</item></result>') } })
  assert.equal(calls, 1); assert.equal(unknown.length, 0)
})

test('reviewed photo file name and official photo ID can differ; no fuzzy matching', async () => {
  const body = '<ccbaKdcd>12</ccbaKdcd><ccbaAsno>0019020000000</ccbaAsno><ccbaCtcd>50</ccbaCtcd><item><imageUrl>http://www.khs.go.kr/unisearch/images/treasure/2016061316550500.JPG</imageUrl><imageNuri>A/F</imageNuri></item>'
  const rows = await searchHeritage({ fetchImpl: async url => new Response('<result>' + (url.includes('SearchImage') ? body : '<item>' + item.replace('1123903220000', '1125019020000').replace('0003220000000', '0019020000000') + '</item>') + '</result>') })
  assert.match(rows[0].image, /2016061316550500.JPG$/)
  assert.match(rows[0].imageSourceUrl, /ccimId=3487850/)
})

test('official heritage detail lookup uses exact identifiers and returns designated fields', async () => {
  let requested
  const detailXml = '<result><ccmaName>보물</ccmaName><ccbaMnm1>제주 관덕정</ccbaMnm1><ccbaCtcdNm>제주특별자치도</ccbaCtcdNm><ccsiName>제주시</ccsiName><ccbaLcad>제주시 관덕로 19</ccbaLcad><ccbaQuan>1동</ccbaQuan><ccbaAsdt>19630121</ccbaAsdt><ccceName>조선 후기</ccceName><ccbaAdmin>제주시</ccbaAdmin><content><![CDATA[<p>역사 설명</p>]]></content></result>'
  const detail = await getHeritageDetail({ ccbaKdcd: '12', ccbaAsno: '0003220000000', ccbaCtcd: '50', fetchImpl: async url => { requested = new URL(url); return new Response(detailXml) } })
  assert.ok(requested.pathname.endsWith('/SearchKindOpenapiDt.do'))
  assert.equal(requested.searchParams.get('ccbaAsno'), '0003220000000')
  assert.equal(detail.name, '제주 관덕정'); assert.equal(detail.kind, '보물')
  assert.equal(detail.address, '제주시 관덕로 19'); assert.equal(detail.designationDate, '19630121')
  assert.equal(detail.description, '역사 설명'); assert.equal(detail.period, '조선 후기')
  await assert.rejects(getHeritageDetail({ ccbaKdcd: 'bad', ccbaAsno: '1', ccbaCtcd: '50' }), /INVALID_HERITAGE_ID/)
})
