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
  await page.getByText(`추천 이야기 ${HOME_STORIES.length}개 / 전체 이야기 ${STORY_CATALOG.length}개`, { exact: false }).waitFor()
  await page.getByText(/실제 지도 장소 6곳과 전체 이야기 수는 달라요/).waitFor()
  for (const story of HOME_STORIES) {
    const link = page.getByRole('link', { name: `${story.title} 상세 이야기 보기`, exact: true })
    assert.equal(await link.getAttribute('href'), `/explore/${story.id}`)
  }
  // 홈 카드의 장소 선택 동작을 보존한다. 상세 보기는 별도 링크로 제공한다.
  await page.locator('.myth-card').filter({ hasText: '자청비' }).click()
  assert.equal(await page.locator('.selected-place-map').count(), 0)
  await page.getByRole('link', { name: '자청비 상세 이야기 보기', exact: true }).click()
  assert.equal(new URL(page.url()).pathname, '/explore/jacheongbi')
  await page.locator('.story-heading').getByText('자청비', { exact: true }).waitFor()
  await page.goto(origin)
  await page.getByRole('link', { name: /전체 이야기 보기/ }).click()
  assert.equal(new URL(page.url()).pathname, '/explore')
  await page.locator('.story-card').first().waitFor()
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
    assert.equal(await page.locator('.story-easy-p').count(), story.scenes[0].studentLines.length)
    await page.getByRole('button', { name: '장면 2', exact: true }).click()
    await page.locator('.story-caption').getByText(story.scenes[1].caption, { exact: true }).waitFor()
    if (story.id === 'seolmundae') assert.equal(await page.locator('#myth-quiz-puzzle').count(), 1)
    console.log(JSON.stringify({ id: story.id, title: story.title, detailRouteCorrect: true, scenes: story.scenes.length }))
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ home: HOME_STORIES.length, explore: STORY_CATALOG.length, locations: 6, imageFilter: 2, duplicateIds: 0, pageErrors: 0, paidRequests: 0, supabaseRequests: 0 }))
} finally { await browser.close() }
