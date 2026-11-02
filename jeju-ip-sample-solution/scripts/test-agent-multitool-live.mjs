// 명시적으로 실행할 때만 유료 호출. 질문 1건, OpenAI HTTP 요청 최대 4회, 재시도 없음.
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
const env = parseEnv(readFileSync(new URL('../.env.local', import.meta.url), 'utf8'))
for (const name of ['OPENAI_API_KEY', 'OPENAI_MODEL', 'DATA_GO_KR_KEY']) {
  if (env[name] !== undefined) process.env[name] = env[name]
}
if (!process.env.OPENAI_API_KEY?.trim()) throw new Error('OpenAI 설정이 없습니다.')
const originalFetch = globalThis.fetch
let openaiRequests = 0, publicRequests = 0
const hosts = new Set(['www.jeju.go.kr', 'www.jeju.go.kr:443', 'api.odcloud.kr', 'apis.data.go.kr'])
globalThis.fetch = async (url, options) => {
  const host = new URL(url).host
  if (host === 'api.openai.com') {
    if (openaiRequests >= 4) throw new Error('유료 요청 상한 도달')
    openaiRequests++
  } else {
    if (!hosts.has(host)) throw new Error('허용하지 않은 외부 서비스')
    publicRequests++
  }
  return originalFetch(url, options)
}
const { default: handler, agentStatus } = await import('../api/agent.js')
let code, body
const response = { setHeader() {}, status(value) { code = value; return this }, json(value) { body = value; return this } }
await handler({ method: 'POST', body: {
  message: '삼성혈을 방문하려고 해. 관련 역사문화 자료, 관광지의 실제 주소와 소개, 제주시의 앞으로 몇 시간 날씨를 각각 확인하고 출처와 함께 한국어로 간단히 안내해 줘. 자료가 없거나 정확히 일치하지 않으면 확인하지 못했다고 말해 줘.',
  history: [],
} }, response)
globalThis.fetch = originalFetch
const checks = {
  httpSuccess: code === 200,
  multipleDistinctTools: new Set(body.steps?.map(s => s.tool)).size >= 2,
  finalKoreanModelAnswer: body.status === 'completed' && body.answerOrigin === 'model' && /[가-힣]/.test(body.answer),
  orderedSourcedResults: Boolean(body.steps?.length) && body.steps.every((s, i) => s.sequence === i + 1 && s.source && s.sourceUrl && Array.isArray(s.preview)),
}
console.log(JSON.stringify({ model: agentStatus().model, openaiRequests, publicRequests, httpStatus: code, checks, ...body }, null, 2))
if (!Object.values(checks).every(Boolean)) process.exitCode = 1
