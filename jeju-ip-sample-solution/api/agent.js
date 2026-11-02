import { catalog } from '../server/myth-tools.js'
import { runAgent, validBody, MODEL, LIMITS } from '../server/agent.js'
import { createOpenAIResponse } from '../server/openai.js'

export function agentStatus() {
  const available = Boolean(process.env.OPENAI_API_KEY?.trim())
  return { available, reason: available ? null : 'key_missing', provider: 'OpenAI', model: MODEL, limits: LIMITS, tools: catalog() }
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const status = agentStatus()
  if (req.method === 'GET') return res.status(200).json(status)
  if (req.method !== 'POST') return res.status(405).json({ error: '지원하지 않는 요청입니다.' })
  if (!status.available) return res.status(503).json({
    code: 'AGENT_NOT_CONFIGURED', error: 'OpenAI 안내원은 설정 대기 중입니다. 다른 메뉴와 직접 자료 조회는 계속 이용할 수 있습니다.', steps: [],
  })
  if (!validBody(req.body)) return res.status(400).json({ error: '질문은 1500자 이내로 입력하고 대화 형식을 확인해 주세요.' })
  const steps = []
  try {
    return res.status(200).json(await runAgent({
      message: req.body.message, history: req.body.history, createResponse: createOpenAIResponse,
      onStep: step => steps.push(step),
    }))
  } catch (error) {
    return res.status(error.status === 429 ? 429 : 502).json({
      error: error.status === 429 ? 'AI 사용량 또는 잔액 한도를 확인해 주세요. 자동 재시도하지 않습니다.' : 'AI 응답을 받지 못했습니다. 설정을 확인하거나 잠시 후 다시 시도해 주세요.',
      steps, usage: error.agentUsage, modelCalls: error.agentModelCalls, usageIncomplete: true,
    })
  }
}
