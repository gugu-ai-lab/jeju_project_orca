import test from 'node:test'
import assert from 'node:assert/strict'
import { runAgent } from '../server/agent.js'
import { executeTool } from '../server/myth-tools.js'
import { searchStoryContent } from '../server/story-search.js'

test('수월봉 질문은 공통 이야기 본문의 수월봉과 녹고물 전설을 찾는다', () => {
  const [story] = searchStoryContent('수월봉 신화 알려줘')
  assert.equal(story.title, '수월봉과 녹고물')
  assert.match(story.content, /수월이/)
  assert.match(story.content, /그 눈물이 절벽 바위틈에서 솟아나는 맑은 샘물/)
})

test('산방산 질문은 산방덕이와 남편 고씨 이야기로 연결된다', () => {
  const [story] = searchStoryContent('산방산에 관련된 이야기 알려줘')
  assert.equal(story.title, '산방덕이')
  assert.match(story.content, /남편 고씨/)
})

test('인물 질문은 자청비 이야기에서 문도령을 찾는다', () => {
  const [story] = searchStoryContent('자청비의 남편은 누구야')
  assert.equal(story.title, '자청비')
  assert.match(story.content, /문도령/)
})

test('이야기 도구 결과가 모의 도구 호출 뒤 모델 답변 문맥으로 전달된다', async () => {
  let turn = 0
  const result = await runAgent({ message: '산방산에 관련된 이야기 알려줘', runTool: executeTool, createResponse: async request => {
    if (turn++ === 0) return { output: [{ type: 'function_call', name: 'search_story_content', arguments: '{"keyword":"산방산에 관련된 이야기 알려줘"}', call_id: 'story-call' }] }
    const toolResult = JSON.parse(request.input.at(-1).output)
    assert.equal(toolResult.items[0].title, '산방덕이')
    assert.match(toolResult.items[0].content, /남편 고씨/)
    assert.equal(toolResult.source, undefined)
    return { output: [{ type: 'message', content: [{ type: 'output_text', text: '산방덕이는 남편 고씨와 살았던 여신 이야기예요.' }] }] }
  } })

  assert.equal(result.answer, '산방덕이는 남편 고씨와 살았던 여신 이야기예요.')
  assert.equal(result.steps[0].tool, 'search_story_content')
  assert.equal(result.steps[0].source, '검증된 제주 신화·전설 이야기')
})
