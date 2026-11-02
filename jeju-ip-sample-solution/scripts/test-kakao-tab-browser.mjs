// 실제 카카오 SDK·마커 클릭·예보 읽기 검증. 키는 읽거나 출력하지 않는다.
import assert from 'node:assert/strict'
import pins from '../src/data/jejuMapPins.json' with { type: 'json' }
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const forbidden = [], errors = []
try {
  const page = await browser.newPage()
  page.on('pageerror', () => errors.push('페이지 실행 오류'))
  await page.route('https://api.openai.com/**', r => { forbidden.push('OpenAI'); return r.abort() })
  await page.route('**/*supabase.co/**', r => { forbidden.push('Supabase'); return r.abort() })
  await page.route('**/api/agent', r => { if (r.request().method() !== 'GET') forbidden.push('AI 요청'); return r.abort() })
  await page.goto(process.env.INTEGRATION_PREVIEW_URL || 'http://127.0.0.1:5181/')
  await page.waitForFunction(() => document.querySelector('.selected-place-map')?.dataset.mapStatus === 'ready')
  const originalSvg = await page.locator('svg.pastel-jeju-svg').evaluate(e => e.outerHTML)
  // SDK 생성자를 감싸 관찰만 하고 실제 SDK 객체와 실제 지도를 그대로 사용한다.
  await page.evaluate(() => {
    const maps = window.kakao.maps, MapClass = maps.Map, MarkerClass = maps.Marker
    window.__leftMaps = []; window.__actualMarkers = []; window.__leftIdleCount = 0; window.__panTargets = []
    function ObservedMap(node, options) {
      const map = new MapClass(node, options)
      if (node.classList.contains('kakao-map-canvas')) {
        window.__leftMaps.push(map)
        maps.event.addListener(map, 'idle', () => { window.__leftIdleCount++ })
        const pan = map.panTo.bind(map)
        map.panTo = position => { window.__panTargets.push([position.getLat(), position.getLng()]); return pan(position) }
      }
      return map
    }
    ObservedMap.prototype = MapClass.prototype; maps.Map = ObservedMap
    function ObservedMarker(options) {
      const marker = new MarkerClass(options)
      window.__actualMarkers.push({ title: options.title, marker })
      return marker
    }
    ObservedMarker.prototype = MarkerClass.prototype; maps.Marker = ObservedMarker
  })
  await page.locator('.map-mode-switch button').nth(1).click()
  await page.waitForFunction(() => document.querySelector('.kakao-map-canvas')?.children.length > 0)
  assert.equal(await page.locator('.kakao-map-canvas [title]').evaluateAll(es => es.filter(e => e.title.includes(' · ')).length), 6)
  for (const id of ['honinji', 'seolmundae']) {
    const pin = pins.find(p => p.mythId === id)
    const title = `${pin.mythTitle} · ${pin.placeName}`
    const point = await page.evaluate(title => {
      const marker = window.__actualMarkers.find(m => m.title === title).marker
      const point = window.__leftMaps.at(-1).getProjection().containerPointFromCoords(marker.getPosition())
      return { x: point.x, y: point.y - 14 }
    }, title)
    const idleBefore = await page.evaluate(() => window.__leftIdleCount)
    await page.locator('.kakao-map-canvas').click({ position: point })
    const panel = page.locator(`[data-place-id="${id}"]`)
    await panel.getByText('현재 관측값이 아닌 주변 지역의 예보예요.', { exact: true }).waitFor()
    await page.waitForFunction(count => window.__leftIdleCount > count, idleBefore)
    const centered = await page.evaluate(({ lat, lng }) => {
      const map = window.__leftMaps.at(-1), node = document.querySelector('.kakao-map-canvas')
      const point = map.getProjection().containerPointFromCoords(new window.kakao.maps.LatLng(lat, lng))
      return { dx: Math.abs(point.x - node.clientWidth / 2), dy: Math.abs(point.y - node.clientHeight / 2), target: window.__panTargets.at(-1) }
    }, { lat: pin.realGeoCoords.lat, lng: pin.realGeoCoords.lng })
    assert.ok(centered.dx <= 1 && centered.dy <= 1)
    assert.ok(Math.abs(centered.target[0] - pin.realGeoCoords.lat) < 0.000001)
    assert.ok(Math.abs(centered.target[1] - pin.realGeoCoords.lng) < 0.000001)
    const actual = await page.evaluate(title => {
      const marker = window.__actualMarkers.find(m => m.title === title).marker.getPosition()
      const center = window.__leftMaps.at(-1).getCenter()
      return { marker: [marker.getLat(), marker.getLng()], center: [center.getLat(), center.getLng()] }
    }, title)
    assert.ok(Math.abs(actual.marker[0] - pin.realGeoCoords.lat) < 0.0001)
    assert.ok(Math.abs(actual.marker[1] - pin.realGeoCoords.lng) < 0.0001)
    const href = await page.locator('.selected-spot-panel a[href*="map.kakao.com/link/to"]').getAttribute('href')
    assert.ok(decodeURIComponent(href).includes(`${pin.realGeoCoords.lat},${pin.realGeoCoords.lng}`))
    console.log(JSON.stringify({ id, actualSdk: true, nativeMarkerClick: true, ...actual, forecastVisible: true, directionsCorrect: true }))
  }
  await page.locator('.map-mode-switch button').first().click()
  await page.locator('svg.pastel-jeju-svg').waitFor()
  assert.equal(await page.locator('svg.pastel-jeju-svg').evaluate(e => e.outerHTML), originalSvg)
  await page.locator('.map-mode-switch button').nth(1).click()
  await page.waitForFunction(() => document.querySelector('.kakao-map-canvas')?.children.length > 0 && window.__leftMaps.length === 2)
  assert.equal(await page.locator('.kakao-map-canvas [title]').evaluateAll(es => es.filter(e => e.title.includes(' · ')).length), 6)
  assert.deepEqual(forbidden, []); assert.deepEqual(errors, [])
  console.log(JSON.stringify({ svgUnchanged: true, tabReturnWorks: true, markerCount: 6, paidRequests: 0, supabaseRequests: 0, pageErrors: 0 }))
} finally { await browser.close() }
