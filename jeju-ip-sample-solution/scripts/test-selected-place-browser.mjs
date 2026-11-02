// 실제 예보 읽기 + 지도 SDK 경계 모의 검증. OpenAI·Supabase 요청은 차단한다.
import assert from 'node:assert/strict'
import pins from '../src/data/jejuMapPins.json' with { type: 'json' }
import { getMythQuizPuzzle } from '../src/data/mythQuizPuzzles.js'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
const origin = process.env.INTEGRATION_PREVIEW_URL || 'http://127.0.0.1:5181'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const sdk = `window.__mapEvents=[]; window.kakao={maps:{
  load:callback=>callback(), LatLng:function(lat,lng){this.lat=lat;this.lng=lng;},
  Map:function(node,options){window.__mapEvents.push({type:'center',...options.center});this.panTo=position=>window.__mapEvents.push({type:'pan',...position});},
  Marker:function(options){this.setMap=map=>{if(map)window.__mapEvents.push({type:'marker',...options.position});};},
  event:{addListener(){}}
}};`
const forbidden = [], results = []
const record = detail => { results.push(detail); console.log(JSON.stringify(detail)) }
async function protect(page) {
  await page.addInitScript(() => {
    window.__gpsRequests = 0
    for (const method of ['getCurrentPosition', 'watchPosition']) navigator.geolocation[method] = () => { window.__gpsRequests++ }
  })
  await page.route('https://api.openai.com/**', r => { forbidden.push('OpenAI'); return r.abort() })
  await page.route('**/*supabase.co/**', r => { forbidden.push('Supabase'); return r.abort() })
  await page.route('**/api/agent', r => { if (r.request().method() !== 'GET') forbidden.push('AI POST'); return r.abort() })
}
try {
  const page = await browser.newPage(); await protect(page)
  const weatherRequests = []
  await page.route('**/api/weather?**', route => { weatherRequests.push(new URL(route.request().url()).searchParams.get('mythId')); return route.continue() })
  await page.route('https://dapi.kakao.com/**', route => route.fulfill({ contentType: 'application/javascript', body: sdk }))
  await page.goto(origin)
  for (const id of ['seolmundae', 'honinji']) {
    const pin = pins.find(p => p.mythId === id)
    if (id === 'honinji') await page.getByRole('button', { name: /혼인지.*신화 선택/ }).click()
    const panel = page.locator('.selected-spot-panel')
    await panel.getByText('현재 관측값이 아닌 주변 지역의 예보예요.', { exact: true }).waitFor()
    await page.waitForFunction(() => document.querySelector('.selected-place-map')?.dataset.mapStatus === 'ready')
    const url = await panel.locator('a[href*="map.kakao.com/link/to"]').getAttribute('href')
    assert.ok(decodeURIComponent(url).includes(`${pin.realGeoCoords.lat},${pin.realGeoCoords.lng}`))
    assert.ok(await panel.getByText(pin.location.address, { exact: true }).isVisible())
    const expected = { lat: pin.realGeoCoords.lat, lng: pin.realGeoCoords.lng }
    const events = await page.evaluate(() => window.__mapEvents)
    assert.ok(events.some(e => e.type === 'center' && e.lat === expected.lat && e.lng === expected.lng))
    assert.ok(events.some(e => e.type === 'marker' && e.lat === expected.lat && e.lng === expected.lng))
    record({ test: '장소 선택 자동 갱신', id, weather: '실제 기상청', map: '모의 SDK 중심·마커 확인', directions: url })
  }
  await page.locator('.map-mode-switch button').nth(1).click()
  await page.locator('.kakao-map-canvas').waitFor()
  const before = weatherRequests.length
  await page.locator('.myth-card').filter({ hasText: '자청비' }).click()
  assert.equal(await page.locator('.selected-place-map').count(), 0)
  assert.equal(await page.locator('.selected-spot-panel a[href*="map.kakao.com"]').count(), 0)
  assert.equal(weatherRequests.length, before)
  await page.getByRole('button', { name: /돌문화공원.*신화 선택/ }).click()
  await page.locator('.kakao-map-canvas').waitFor()
  await page.waitForFunction(() => document.querySelector('.selected-place-map')?.dataset.mapStatus === 'ready')
  record({ test: '자청비 위치·날씨·길찾기 미제공 및 실제 장소 복귀', passed: true })

  // 늦은 이전 응답이 새 장소의 정보를 덮지 않는지 확인한다.
  const race = await browser.newPage(); await protect(race)
  await race.route('https://dapi.kakao.com/**', route => route.fulfill({ contentType: 'application/javascript', body: sdk }))
  const replies = []
  await race.route('**/api/weather?**', async route => {
    const id = new URL(route.request().url()).searchParams.get('mythId')
    if (id === 'seolmundae') await new Promise(resolve => setTimeout(resolve, 800))
    try {
      await route.fulfill({ json: { mythId: id, kind: 'forecast', baseDate: '20261102', baseTime: '1400', items: [{ id, time:'20261102 1600', temp: id === 'honinji' ? 28 : 9, sky:'맑음', pop:0 }] } })
    } catch { /* 취소된 이전 장소의 요청은 무시한다. */ }
    replies.push(id)
  })
  await race.goto(origin)
  await race.getByRole('button', { name: /혼인지.*신화 선택/ }).click()
  await race.locator('[data-place-id="honinji"]').getByText(/28°C/).waitFor()
  await race.waitForTimeout(900)
  assert.equal(await race.locator('[data-place-id="honinji"]').getByText(/9°C/).count(), 0)
  record({ test: '이전 장소의 늦은 예보 무시', passed: true })

  const failed = await browser.newPage(); await protect(failed)
  await failed.route('https://dapi.kakao.com/**', route => route.abort())
  await failed.route('**/api/weather?**', route => route.fulfill({ status: 503, json: { error: '조회 실패' } }))
  await failed.goto(origin)
  await failed.getByText('예보를 불러오지 못했어요. 이야기와 퀴즈는 계속 즐길 수 있어요.', { exact: true }).waitFor()
  await failed.getByText('지도를 불러오지 못했어요. 아래 길찾기에서 위치를 확인해 주세요.', { exact: true }).waitFor()
  const config = getMythQuizPuzzle('seolmundae')
  for (let i = 0; i < 3; i++) {
    const q = config.questions[i]
    await failed.getByRole('tab', { name: new RegExp(`${i + 1}번 퀴즈`) }).click()
    await failed.getByRole('button', { name: q.options.find(o => o.id === q.correctOptionId).text }).click()
  }
  await failed.getByText('세 조각 모두 완성!', { exact: false }).waitFor()
  record({ test: '지도·예보 실패 시에도 이야기·퍼즐 유지', passed: true })
  assert.deepEqual(forbidden, [])
  for (const context of browser.contexts()) for (const page of context.pages()) assert.equal(await page.evaluate(() => window.__gpsRequests), 0)
  console.log(JSON.stringify({ checks: results.length, paidRequests: 0, supabaseRequests: 0, gpsRequested: false }))
} finally { await browser.close() }
