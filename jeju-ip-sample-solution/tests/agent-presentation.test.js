import test from 'node:test'
import assert from 'node:assert/strict'
import { presentAgentMessage, presentToolStep } from '../services/agent-presentation.js'
test('tool data, order and source survive the Gemini display adapter', () => {
  const input = { tool: 'search_myths', status: 'success', outcome: 'partial', count: 3, source: '공식 출처', sourceUrl: 'https://www.data.go.kr/', preview: [{ title: '자료' }], sequence: 2 }
  const result = presentToolStep(input)
  assert.equal(result.name, 'search_myths'); assert.equal(result.status, 'ok')
  assert.equal(result.sequence, 2); assert.deepEqual(result.preview, input.preview)
  assert.equal(result.sourceUrl, input.sourceUrl); assert.match(result.message, /일부/)
  assert.equal(input.status, 'success')
})
test('empty and error never display as successful data; final answer is retained', () => {
  const output = presentAgentMessage({ text: '확인하지 못했습니다.', steps: [
    { tool: 'search_myths', status: 'success', outcome: 'empty', count: 0 },
    { tool: 'get_weather', status: 'error', error: '조회 실패', count: 0 },
  ] })
  assert.deepEqual(output.steps.map(s => s.status), ['empty', 'error'])
  assert.equal(output.steps[1].message, '조회 실패')
  assert.equal(output.text, '확인하지 못했습니다.')
})
