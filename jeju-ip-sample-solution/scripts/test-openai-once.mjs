// 수동 실행 전용: 유료 OpenAI HTTP 요청은 최대 1회. 자동 재시도/후속 모델 요청 없음.
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createOpenAIResponse } from '../server/openai.js'
import { executeTool, safeErrors } from '../server/myth-tools.js'

const local = parseEnv(readFileSync(new URL('../.env.local', import.meta.url), 'utf8'))
const apiKey = local.OPENAI_API_KEY?.trim()
if (!apiKey) {
  console.log(JSON.stringify({ status: 'waiting_for_key', paidRequests: 0 }))
  process.exit(2)
}
process.env.DATA_GO_KR_KEY = local.DATA_GO_KR_KEY || ''
process.env.OPENAI_MODEL = local.OPENAI_MODEL?.trim() || 'gpt-6-luna'
const { MODEL, SYSTEM, LIMITS, openAITools } = await import('../server/agent.js')
let requests = 0
try {
  const result = await createOpenAIResponse({
    model: MODEL, instructions: SYSTEM,
    input: [{ role: 'user', content: '설문대할망 관련 자료의 제목과 출처를 찾아 줘.' }],
    tools: openAITools, tool_choice: 'required', parallel_tool_calls: false,
    max_output_tokens: LIMITS.outputTokens, reasoning: { effort: 'none' }, text: { verbosity: 'low' }, store: false,
  }, { apiKey, fetchImpl: (...args) => {
    if (++requests > 1) throw new Error('PAID_REQUEST_LIMIT')
    return fetch(...args)
  } })
  const calls = (result.output || []).filter(item => item.type === 'function_call')
  const steps = []
  for (const call of calls.slice(0, LIMITS.toolCalls)) {
    try {
      const data = await executeTool(call.name, JSON.parse(call.arguments))
      steps.push({ tool: call.name, status: 'success', count: data.count, source: data.source, complete: data.complete })
    } catch (error) {
      steps.push({ tool: openAITools.some(t => t.name === call.name) ? call.name : 'unknown_tool',
        status: 'error', error: safeErrors[error.message] || '공공데이터 조회 실패' })
    }
  }
  console.log(JSON.stringify({
    status: calls.length ? 'function_call_tested' : 'no_function_call', configuredModelUsed: true, paidRequests: requests,
    inputTokens: result.usage?.input_tokens ?? null, cachedInputTokens: result.usage?.input_tokens_details?.cached_tokens ?? 0,
    outputTokens: result.usage?.output_tokens ?? null, totalTokens: result.usage?.total_tokens ?? null,
    steps, followupModelRequests: 0, finalAnswerTested: false,
  }))
} catch (error) {
  console.log(JSON.stringify({ status: 'failed', configuredModelUsed: true, paidRequests: requests,
    httpStatus: error.status || null, message: '호출에 실패했습니다. 자동 재시도하지 않았습니다. 키 또는 모델 접근 권한을 확인해 주세요.' }))
  process.exitCode = 1
}
