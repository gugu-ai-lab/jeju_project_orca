import test from 'node:test'
import assert from 'node:assert/strict'
import { runAgent, openAITools, LIMITS, SYSTEM } from '../server/agent.js'
const call = (name, args, id) => ({ type: 'function_call', name, arguments: JSON.stringify(args), call_id: id })
const final = text => ({ output: [{ type: 'message', content: [{ type: 'output_text', text }] }] })
const populated = () => ({ items: [{ title: '확인된 자료' }], count: 1, complete: true, fetchedAt: '2026-11-02T00:00:00Z' })

test('five tools use automatic selection; ordered results and sources survive JSON transport', async () => {
  assert.deepEqual(openAITools.map(t => t.name).sort(), ['get_weather', 'search_culture', 'search_locations', 'search_myths', 'search_tour_places'])
  for (const tool of openAITools) {
    let turn = 0
    const args = tool.name === 'get_weather' ? { place: '제주시' } : { keyword: '삼성혈' }
    const result = await runAgent({ message: '관련 자료를 확인해 줘', runTool: async () => populated(), createResponse: async request => {
      assert.equal(request.tool_choice, 'auto')
      if (turn++ === 0) return { output: [call(tool.name, args, 'one')] }
      const payload = JSON.parse(request.input.at(-1).output)
      assert.ok(payload.sourceUrl.startsWith('https://www.data.go.kr/'))
      assert.equal(payload.fetchedAtKst, '2026-11-02 09:00:00 KST')
      assert.match(SYSTEM, /정확히 같은 이름의 항목이 없는 것과 관련 자료가 없는 것을 구분/)
      return final('확인된 자료를 안내합니다.')
    } })
    const transported = JSON.parse(JSON.stringify(result))
    assert.equal(transported.steps[0].sequence, 1)
    assert.equal(transported.steps[0].outcome, 'success')
    assert.equal(transported.steps[0].preview[0].title, '확인된 자료')
    assert.ok(transported.steps[0].source)
    assert.ok(transported.steps[0].sourceUrl)
    assert.equal(transported.answerOrigin, 'model')
  }
})

test('empty and failed tools retain sources; ungrounded final text is replaced', async () => {
  let turn = 0
  const result = await runAgent({ message: '없는 자료', runTool: async name => {
    if (name === 'search_culture') throw new Error('private upstream body')
    return { items: [], count: 0, complete: true }
  }, createResponse: async () => {
    if (turn++ === 0) return { output: [call('search_myths', { keyword: '없는자료' }, 'a'), call('search_culture', { keyword: '없는자료' }, 'b')] }
    return final('확인되지 않은 줄거리를 만들어 봅니다.')
  } })
  assert.deepEqual(result.steps.map(s => s.outcome), ['empty', 'error'])
  assert.deepEqual(result.steps.map(s => s.sequence), [1, 2])
  assert.ok(result.steps.every(s => s.source && s.sourceUrl))
  assert.equal(result.warnings.length, 2)
  assert.equal(result.answerOrigin, 'safe_fallback')
  assert.match(result.answer, /찾지 못했습니다/)
  assert.match(result.answer, /조회에 실패/)
  assert.doesNotMatch(JSON.stringify(result), /private upstream|줄거리를 만들어/)
})

test('all empty tool results produce a short friendly answer without fabricated details', async () => {
  let turn = 0
  const result = await runAgent({ message: '에펠탑 제주', runTool: async () => ({ items: [], count: 0, complete: true }), createResponse: async () => {
    if (turn++ === 0) return { output: [call('search_locations', { keyword: '에펠탑' }, 'a'), call('search_tour_places', { keyword: '에펠탑 제주' }, 'b')] }
    return final('자료가 있다고 가정한 잘못된 답변')
  } })
  assert.equal(result.answer, '질문하신 정보를 찾지 못했어요. 다시 검색해 주세요.')
  assert.equal(result.answerOrigin, 'safe_fallback')
  assert.deepEqual(result.steps.map(step => step.outcome), ['empty', 'empty'])
})

test('bounded payload counts and cached usage are accurate', async () => {
  let turn = 0
  const result = await runAgent({ message: '자료', runTool: async () => ({ items: Array.from({ length: 3 }, () => ({ title: '가'.repeat(500), description: '나'.repeat(900), publisher: '다'.repeat(500), address: '라'.repeat(500), id: '마'.repeat(500), copyright: '바'.repeat(500) })), count: 10, complete: false }), createResponse: async request => {
    if (turn++ === 0) return { output: [call('search_myths', { keyword: '제주' }, 'a')], usage: { input_tokens: 100, output_tokens: 20, input_tokens_details: { cached_tokens: 30 } } }
    const payload = JSON.parse(request.input.at(-1).output)
    assert.ok(request.input.at(-1).output.length <= LIMITS.resultChars)
    assert.equal(payload.displayedCount, payload.items.length)
    assert.equal(payload.resultTruncated, true)
    return { ...final('일부 자료만 확인했습니다.'), usage: { input_tokens: 200, output_tokens: 40, input_tokens_details: { cached_tokens: 50 } } }
  } })
  assert.deepEqual(result.usage, { inputTokens: 300, cachedInputTokens: 80, outputTokens: 60, totalTokens: 360 })
  assert.equal(result.modelCalls, 2)
  assert.equal(result.steps[0].outcome, 'partial')
})

test('provider failure preserves consumed usage and request count without retry', async () => {
  let calls = 0
  await assert.rejects(runAgent({ message: '자료', runTool: async () => populated(), createResponse: async () => {
    if (++calls === 1) return { output: [call('search_myths', { keyword: '제주' }, 'a')], usage: { input_tokens: 10, output_tokens: 5 } }
    throw new Error('MODEL_UNAVAILABLE')
  } }), error => error.agentModelCalls === 2 && error.agentUsage.totalTokens === 15)
  assert.equal(calls, 2)
})
