// 실행 전 별도 미리보기 서버 필요. OpenAI와 Supabase는 네트워크 차단하며 모의 결과만 사용한다.
import assert from 'node:assert/strict'
import { getMythQuizPuzzle } from '../src/data/mythQuizPuzzles.js'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright')
const origin = process.env.INTEGRATION_PREVIEW_URL || 'http://127.0.0.1:5181'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const checks = [], forbidden = [], errors = []
const record = (name, detail) => { checks.push({ name, ...detail }); console.log(JSON.stringify(checks.at(-1))) }
async function protect(page) {
  page.on('pageerror', e => errors.push(e.message))
  await page.route('https://api.openai.com/**', route => { forbidden.push('OpenAI'); return route.abort() })
  await page.route('**/*supabase.co/**', route => { forbidden.push('Supabase'); return route.abort() })
}
try {
  const actual = await browser.newPage(); await protect(actual)
  await actual.goto(origin + '/my')
  await actual.getByRole('alert').getByText(/안전 미리보기에서는/).first().waitFor()
  record('실제 인증·DB 요청 차단 설정', { passed: true })
  await actual.close()
  const page = await browser.newPage(); await protect(page)
  // UI 경계만 대체한다. 실제 인증·RLS·DB 동작은 기존 자동 테스트가 별도로 검증한다.
  await page.route('**/services/browser-favorites*', route => route.fulfill({ contentType: 'application/javascript', body: `
    const key = 'integration-mock-favorites';
    const rows = () => JSON.parse(localStorage.getItem(key) || '[]');
    const write = value => localStorage.setItem(key, JSON.stringify(value));
    export async function listMythFavorites() { return rows(); }
    export async function saveMythFavorite(input) {
      const existing = rows().find(r => r.storyId === input.storyId);
      const favorite = existing || { id: input.storyId, ...input, createdAt: '2026-11-02T00:00:00Z' };
      write([favorite, ...rows().filter(r => r.storyId !== input.storyId)]);
      return { favorite, created: !existing };
    }
    export async function deleteMythFavorite(id) { write(rows().filter(r => r.storyId !== id)); return { deleted: true, deletedCount: 1 }; }
  ` }))
  let mockAgent = false, mockedAgentRequests = 0
  const step = (tool, n) => ({ sequence: n, tool, args: tool === 'get_weather' ? { place: '제주시' } : { keyword: '설문대' }, status: 'success', outcome: 'success', count: 1, source: n === 1 ? '제주신화정보' : '기상청 단기예보', sourceUrl: 'https://www.data.go.kr/', fetchedAtKst: '2026-11-02 13:00:00 KST', preview: [{ id: String(n), title: n === 1 ? '모의 신화 자료' : '모의 제주시 예보', time: n === 2 ? '20261102 1400' : undefined, temp: 18, sky: '맑음', pop: 0 }] })
  await page.route('**/api/agent', async route => {
    if (!mockAgent && route.request().method() === 'GET') return route.continue()
    if (!mockAgent) throw new Error('허용되지 않은 실제 AI 요청')
    if (route.request().method() === 'GET') return route.fulfill({ json: { available: true, model: '모의 검증', tools: [] } })
    mockedAgentRequests++
    const { message } = route.request().postDataJSON()
    if (message.includes('오류')) return route.fulfill({ status: 502, json: { error: '모의 공급자 오류', steps: [{ ...step('get_weather', 1), status: 'error', outcome: 'error', count: 0, error: '모의 조회 실패', preview: [] }] } })
    const empty = message.includes('빈 결과')
    return route.fulfill({ json: { status: 'completed', answer: empty ? '모의 응답: 해당 자료를 찾지 못했습니다.' : '모의 응답: 신화 자료와 날씨를 확인했습니다.', steps: empty ? [{ ...step('search_myths', 1), count: 0, outcome: 'empty', preview: [] }] : [step('search_myths', 1), step('get_weather', 2)] } })
  })
  await page.goto(origin)
  await page.locator('svg.pastel-jeju-svg').waitFor()
  await page.getByRole('button', { name: /삼성혈.*신화 선택/ }).click()
  await page.locator('.jeju-map-pin.is-selected').waitFor()
  record('SVG 지도와 장소 선택', { passed: true })
  await page.getByRole('button', { name: /돌문화공원.*신화 선택/ }).click()
  const config = getMythQuizPuzzle('seolmundae')
  for (const i of [1, 0, 2]) {
    const q = config.questions[i]
    await page.getByRole('tab', { name: new RegExp(`${i + 1}번 퀴즈`) }).click()
    const text = q.options.find(o => o.id === q.correctOptionId).text
    await page.getByRole('button', { name: text, exact: false }).click()
  }
  await page.getByText('세 조각 모두 완성!', { exact: false }).waitFor()
  await page.getByRole('button', { name: '완성된 그림 크게 감상하기', exact: false }).click()
  await page.locator('.puzzle-lightbox-image-wrap img').waitFor()
  assert.equal(await page.locator('.puzzle-lightbox-image-wrap img').evaluate(i => i.complete && i.naturalWidth > 0), true)
  record('설문대할망 퀴즈 3문제·3조각·완성 그림', { passed: true })
  await page.goto(origin + '/explore')
  await page.locator('.story-card').first().click()
  assert.match(page.url(), /\/explore\/[^/]+/)
  await page.goto(origin + '/explore/seolmundae')
  await page.getByRole('button', { name: /이야기 즐겨찾기/ }).click()
  await page.goto(origin + '/my')
  await page.getByText('설문대할망', { exact: true }).waitFor()
  await page.reload(); await page.getByText('설문대할망', { exact: true }).waitFor()
  await page.getByRole('button', { name: '즐겨찾기 삭제', exact: true }).click()
  await page.getByText('아직 저장한 항목이 없어요', { exact: true }).waitFor()
  record('이야기 탐색·상세와 즐겨찾기 저장·재접속·삭제', { passed: true, mode: '서비스 경계 모의 테스트' })
  mockAgent = true
  await page.goto(origin + '/agent')
  await page.getByRole('textbox', { name: '질문 입력' }).fill('신화 자료와 날씨를 확인해 줘')
  await page.getByRole('button', { name: '보내기', exact: false }).click()
  await page.getByText('모의 응답: 신화 자료와 날씨를 확인했습니다.', { exact: true }).waitFor()
  assert.equal(await page.locator('.tool-step').count(), 2)
  assert.equal(await page.locator('.tool-step a').count(), 2)
  await page.getByRole('textbox', { name: '질문 입력' }).fill('빈 결과 확인')
  await page.getByRole('button', { name: '보내기', exact: false }).click()
  await page.getByText('모의 응답: 해당 자료를 찾지 못했습니다.', { exact: true }).waitFor()
  await page.getByRole('textbox', { name: '질문 입력' }).fill('오류 확인')
  await page.getByRole('button', { name: '보내기', exact: false }).click()
  await page.getByRole('alert').getByText('모의 공급자 오류', { exact: false }).first().waitFor()
  record('AI 도구 순서·출처·최종 답변·빈 결과·오류 표시', { passed: true, mode: '모의 응답', mockedAgentRequests })
  await page.goto(origin + '/heritage')
  await page.waitForFunction(() => document.querySelectorAll('.item-card').length === 10 && [...document.querySelectorAll('.item-card img')].every(i => i.complete))
  const heritage = await page.locator('.item-card img').evaluateAll(es => es.map(e => ({ title: e.alt, loaded: e.complete && e.naturalWidth > 0 })))
  assert.equal(heritage.filter(i => i.loaded).length, 7)
  record('국가유산 실제 사진·기본 그림', { passed: true, cards: 10, loaded: heritage.length, placeholders: await page.locator('.placeholder-img').count() })
  await page.route('**/unisearch/images/treasure/1623059.jpg', route => route.abort())
  await page.reload(); await page.waitForFunction(() => document.querySelectorAll('.placeholder-img').length === 4)
  record('이미지 실패 시 카드 유지', { passed: await page.locator('.item-card').count() === 10 })
  await page.goto(origin + '/places')
  await page.locator('.item-card').first().waitFor()
  await page.waitForFunction(() => [...document.querySelectorAll('.item-card img')].every(i => i.complete))
  assert.equal(await page.locator('.item-card img').evaluateAll(es => es.filter(i => i.naturalWidth > 0).length), 2)
  await page.getByPlaceholder('검색어').fill('한수풀'); await page.getByPlaceholder('검색어').press('Enter')
  await page.getByText('한수풀 해녀학교', { exact: true }).waitFor()
  assert.equal(await page.locator('.placeholder-img').count(), 1)
  record('관광 실제 사진·한수풀 기본 그림', { passed: true })
  assert.deepEqual(forbidden, []); assert.deepEqual(errors, [])
  console.log(JSON.stringify({ passed: checks.length, externalPaidRequests: 0, supabaseRequests: 0, pageErrors: errors.length }))
} finally { await browser.close() }
