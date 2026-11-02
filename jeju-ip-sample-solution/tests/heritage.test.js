import test from 'node:test'
import assert from 'node:assert/strict'
import { searchHeritage } from '../server/heritage.js'
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
})
test('restricted license, different identifier and different photo never get linked', async () => {
  for (const body of [photo('D/F'), photo('A/F').replace('0003220000000', '0011870000000'), photo('A/F').replace('1623059.jpg', '1623060.jpg')]) {
    assert.equal((await searchHeritage({ fetchImpl: mock(body) }))[0].image, undefined)
  }
})
test('photo outage preserves search result; unreviewed items need no photo requests', async () => {
  const rows = await searchHeritage({ fetchImpl: async url => { if (url.includes('SearchImage')) throw new Error('offline'); return new Response('<result><item>' + item + '</item></result>') } })
  assert.equal(rows[0].name, '제주 관덕정'); assert.equal(rows[0].image, undefined)
  let calls = 0
  const unknown = await searchHeritage({ fetchImpl: async () => { calls++; return new Response('<result><item>' + item.replace('1123903220000', '1123905470200') + '</item></result>') } })
  assert.equal(calls, 1); assert.equal(unknown[0].image, undefined)
})
