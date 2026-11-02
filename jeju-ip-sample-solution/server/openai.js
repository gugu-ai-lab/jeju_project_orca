// 서버 전용. SDK 자동 재시도와 원본 공급자 오류 출력 없이 고정된 공식 URL만 호출한다.
export async function createOpenAIResponse(options, { apiKey = process.env.OPENAI_API_KEY, fetchImpl = fetch } = {}) {
  if (!apiKey?.trim()) throw new Error('OPENAI_KEY_MISSING')
  let response
  try {
    response = await fetchImpl('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: 'Bearer ' + apiKey.trim(), 'Content-Type': 'application/json' },
      body: JSON.stringify(options), signal: AbortSignal.timeout(25000),
    })
  } catch { throw new Error('MODEL_UNAVAILABLE') }
  if (!response.ok) {
    const error = new Error(response.status === 429 ? 'MODEL_RATE_LIMIT' : 'MODEL_UNAVAILABLE')
    error.status = response.status
    throw error
  }
  try { return await response.json() } catch { throw new Error('MODEL_UNAVAILABLE') }
}
