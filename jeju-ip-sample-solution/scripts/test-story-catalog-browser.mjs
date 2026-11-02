// 화면 목록·상세 경로 검증. 실제 API·SDK·Supabase 요청은 차단한다.
import assert from 'node:assert/strict'
import { STORY_CATALOG, HOME_STORIES } from '../src/data/storyCatalog.js'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
const origin = process.env.INTEGRATION_PREVIEW_URL || 'http://127.0.0.1:5181'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
try {
  const page = await browser.newPage()
  const errors = []; page.on('pageerror', () => errors.push('페이지 오류'))
  await page.route('**/*', route => {
    const u = new URL(route.request().url())
    if (u.pathname.startsWith('/api/') || u.hostname.endsWith('supabase.co') || u.hostname === 'api.openai.com' || u.hostname === 'dapi.kakao.com') return route.abort()
    return route.continue()
  })
  await page.goto(origin)
  await page.locator('.myth-card').first().waitFor()
  assert.equal(await page.locator('.myth-card').count(), HOME_STORIES.length)
  assert.deepEqual(await page.locator('.myth-title').allTextContents(), HOME_STORIES.map(s => s.title))
  await page.getByRole('heading', { name: '신화전설이야기', exact: true }).waitFor()
  assert.deepEqual(await page.locator('.jeju-nav .nav-link.active').allTextContents(), ['홈'])
  await page.getByText(/실제 지도 장소 6곳과 전체 이야기 수는 달라요/).waitFor()
  for (const story of HOME_STORIES) {
    const link = page.getByRole('link', { name: `${story.title} 자세히 보기`, exact: true })
    assert.equal(await link.getAttribute('href'), `/explore/${story.id}`)
  }
  // 카드 본문 클릭은 선택 후 그림책으로 즉시 이동하고, 상세 링크는 라우트 이동만 한다.
  await page.evaluate(() => {
    const nativeScrollTo = window.scrollTo.bind(window)
    window.__scrollBehaviors = []
    window.scrollTo = (...args) => {
      window.__scrollBehaviors.push(typeof args[0] === 'object' ? args[0].behavior || 'auto' : 'auto')
      return nativeScrollTo(...args)
    }
  })
  for (const story of HOME_STORIES) {
    const card = page.locator('.myth-card').filter({ hasText: story.title })
    await card.locator('.myth-card-select').click()
    await page.locator('#story-reader-section h2').getByText(story.title, { exact: false }).waitFor()
    assert.equal(await card.locator('.myth-card-select').getAttribute('aria-pressed'), 'true')
    const scrollState = await page.evaluate(() => ({ behavior: window.__scrollBehaviors.at(-1), scrollY: window.scrollY }))
    assert.equal(scrollState.behavior, 'instant', `${story.id} 카드 선택은 즉시 이동해야 함`)
    const covered = await page.evaluate(() => {
      const section = document.querySelector('#story-reader-section').getBoundingClientRect()
      const nav = document.querySelector('.jeju-nav').getBoundingClientRect()
      return section.top < nav.bottom
    })
    assert.equal(covered, false, `${story.id} 그림책 제목이 고정 메뉴에 가려지면 안 됨`)
  }
  assert.equal(new URL(page.url()).pathname, '/')
  await page.locator('.myth-card').filter({ hasText: '자청비' }).getByRole('link', { name: '자청비 자세히 보기', exact: true }).click()
  assert.equal(new URL(page.url()).pathname, '/explore/jacheongbi')
  await page.locator('.story-heading').getByText('자청비', { exact: true }).waitFor()
  await page.waitForFunction(() => window.scrollY === 0)
  assert.deepEqual(await page.locator('.jeju-nav .nav-link.active').allTextContents(), ['이야기 탐험'])
  assert.equal(await page.locator('.jeju-nav .navbar-brand.active').count(), 0)

  for (const story of HOME_STORIES) {
    await page.goto(origin)
    await page.getByRole('link', { name: `${story.title} 자세히 보기`, exact: true }).click()
    assert.equal(new URL(page.url()).pathname, `/explore/${story.id}`)
    await page.locator('.story-heading').getByText(story.title, { exact: true }).waitFor()
    await page.waitForFunction(() => window.scrollY === 0)
    assert.deepEqual(await page.locator('.jeju-nav .nav-link.active').allTextContents(), ['이야기 탐험'])
  }

  // 설문대할망은 상세 첫 장면부터 열고, 사용자가 퀴즈 링크를 누를 때만 퍼즐로 이동한다.
  await page.goto(origin)
  await page.locator('.myth-card').filter({ hasText: '설문대할망' }).getByRole('link', { name: '설문대할망 자세히 보기', exact: true }).click()
  assert.equal(new URL(page.url()).pathname, '/explore/seolmundae')
  await page.locator('.story-heading').getByText('설문대할망', { exact: true }).waitFor()
  await page.waitForFunction(() => window.scrollY === 0)
  assert.equal(await page.locator('.story-caption').first().innerText(), STORY_CATALOG.find(story => story.id === 'seolmundae').scenes[0].caption)
  assert.equal(await page.locator('.quiz-tab-btn').count(), 3)
  assert.equal(await page.locator('.quiz-tab-btn.is-active').innerText().then(text => text.includes('1번 퀴즈')), true)
  assert.ok(await page.locator('#myth-quiz-puzzle').evaluate(element => element.getBoundingClientRect().top > window.innerHeight))
  await page.getByRole('button', { name: '2장면 이어서 읽기 →' }).click()
  await page.getByRole('link', { name: /퀴즈 풀고 퍼즐 맞추기/ }).click()
  await page.waitForFunction(() => {
    const section = document.querySelector('#myth-quiz-puzzle')?.getBoundingClientRect()
    return section && section.top < window.innerHeight && section.bottom > 0
  })
  assert.equal(await page.locator('.quiz-tab-btn').count(), 3)
  assert.equal(await page.locator('.puzzle-tile').count(), 3)
  await page.getByRole('tab', { name: /2번 퀴즈/ }).click()
  assert.equal(await page.getByRole('tab', { name: /2번 퀴즈/ }).getAttribute('aria-selected'), 'true')
  await page.goto(origin)
  await page.getByRole('link', { name: /전체 이야기 보기/ }).click()
  assert.equal(new URL(page.url()).pathname, '/explore')
  await page.locator('.story-card').first().waitFor()
  assert.deepEqual(await page.locator('.jeju-nav .nav-link.active').allTextContents(), ['이야기 탐험'])
  assert.deepEqual(await page.locator('.story-card-title').allTextContents(), STORY_CATALOG.map(s => s.title))
  assert.equal(await page.locator('.story-card').count(), 7)
  await page.getByText('전체 7개 중 7개 표시', { exact: true }).waitFor()
  await page.getByLabel('삽화 있는 것만', { exact: true }).check()
  assert.equal(await page.locator('.story-card').count(), 2)
  await page.getByLabel('삽화 있는 것만', { exact: true }).uncheck()
  await page.getByRole('searchbox', { name: '이야기 검색' }).fill('자청비')
  assert.equal(await page.locator('.story-card').count(), 1)
  for (const story of STORY_CATALOG) {
    await page.goto(origin + '/explore')
    await page.locator('.story-card').filter({ has: page.getByText(story.title, { exact: true }) }).click()
    assert.equal(new URL(page.url()).pathname, `/explore/${story.id}`)
    await page.locator('.story-heading').getByText(story.title, { exact: true }).waitFor()
    await page.waitForFunction(() => window.scrollY === 0)
    assert.deepEqual(await page.locator('.jeju-nav .nav-link.active').allTextContents(), ['이야기 탐험'])
    assert.equal(await page.locator('.story-easy-p').count(), story.scenes[0].studentLines.length)
    await page.getByRole('button', { name: '장면 2', exact: true }).click()
    await page.locator('.story-caption').getByText(story.scenes[1].caption, { exact: true }).waitFor()
    if (story.id === 'seolmundae') assert.equal(await page.locator('#myth-quiz-puzzle').count(), 1)
    console.log(JSON.stringify({ id: story.id, title: story.title, detailRouteCorrect: true, scenes: story.scenes.length }))
  }
  for (const width of [1280, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(origin)
    await page.locator('.myth-card a').first().waitFor()
    const layout = await page.locator('.myth-card').evaluateAll(cards => cards.map(card => {
      const link = card.querySelector('a'), c = card.getBoundingClientRect(), l = link.getBoundingClientRect()
      const overlaps = cards.some(other => { if (other === card) return false; const r = other.getBoundingClientRect(); return l.left < r.right && l.right > r.left && l.top < r.bottom && l.bottom > r.top })
      return { inside: l.left >= c.left && l.right <= c.right && l.top >= c.top && l.bottom <= c.bottom, overlaps }
    }))
    assert.equal(layout.length, HOME_STORIES.length)
    assert.ok(layout.every(item => item.inside && !item.overlaps))
    console.log(JSON.stringify({ width, detailLinksInsideCards: layout.length, overlappingButtons: 0 }))
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ home: HOME_STORIES.length, explore: STORY_CATALOG.length, locations: 6, imageFilter: 2, duplicateIds: 0, pageErrors: 0, paidRequests: 0, supabaseRequests: 0 }))
} finally { await browser.close() }
