import assert from 'node:assert/strict'
import pins from '../src/data/jejuMapPins.json' with { type:'json' }
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH||'playwright')
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true})
try {
  const page=await browser.newPage()
  await page.route('**/*supabase.co/**',r=>r.abort())
  await page.route('**/api/agent',r=>r.abort())
  await page.goto('http://127.0.0.1:5181/')
  await page.locator('svg.pastel-jeju-svg').waitFor()
  assert.equal(await page.locator('.map-mode-switch').count(),0)
  assert.equal(await page.getByText('그림책지도',{exact:false}).count(),1)
  for(const width of[1280,768,390]) {
    await page.setViewportSize({width,height:900})
    await page.locator('svg.pastel-jeju-svg').scrollIntoViewIfNeeded()
    for(const pin of pins.filter(p=>p.hasVerifiedLocation)) {
      const position=await page.evaluate(({x,y,name})=>{
        const svg=document.querySelector('svg.pastel-jeju-svg')
        const point=new DOMPoint(x,y).matrixTransform(svg.getScreenCTM())
        const element=[...document.querySelectorAll('.jeju-map-pin')].find(e=>e.getAttribute('aria-label').startsWith(name+' ('))
        const r=element.getBoundingClientRect()
        return {dx:Math.abs((r.left+r.right)/2-point.x),dy:Math.abs(r.bottom-point.y)}
      },{x:pin.illustrationCoords.svgX,y:pin.illustrationCoords.svgY,name:pin.placeName})
      assert.ok(position.dx<1&&position.dy<1,JSON.stringify({width,id:pin.mythId,...position}))
    }
    console.log(JSON.stringify({width,pinsAligned:6}))
  }
  for (const id of ['seolmundae', 'honinji']) {
    const pin = pins.find(p => p.mythId === id)
    await page.locator('.explorer-map-chips .map-place-chip').filter({hasText: pin.buttonLabel || pin.mythTitle}).click()
    assert.equal(await page.locator('.jeju-map-pin').count(), 1)
    assert.ok((await page.locator('.jeju-map-pin').getAttribute('aria-label')).startsWith(pin.placeName))
    await page.locator(`[data-place-id="${id}"]`).waitFor()
  }
  await page.getByRole('button', {name:'🗺️ 전체 장소 보기', exact:true}).click()
  assert.equal(await page.locator('.jeju-map-pin').count(), 6)
  assert.ok(await page.locator('.map-place-chip').first().evaluate(e => e.getBoundingClientRect().height >= 48))
  console.log(JSON.stringify({singlePinSelectionWorks:true,restoreAllPins:6,largerButtons:true}))
  await page.setViewportSize({width:1280,height:900})
  await page.getByRole('button',{name:/혼인지.*신화 선택/}).click()
  await page.locator('[data-place-id="honinji"]').getByText('현재 관측값이 아닌 주변 지역의 예보예요.',{exact:true}).waitFor()
  await page.waitForFunction(()=>document.querySelector('.selected-place-map')?.dataset.mapStatus==='ready')
  assert.equal(await page.locator('svg.pastel-jeju-svg').count(),1)
  console.log(JSON.stringify({svgRemainsVisible:true,rightRealMapWorks:true,forecastWorks:true}))
} finally {await browser.close()}
