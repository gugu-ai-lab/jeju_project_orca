// 서버 응답은 보존하고 Gemini 표현 컴포넌트에 필요한 필드를 덧붙인다.
export function presentToolStep(step, index = 0) {
  const outcome = step.outcome || (step.status === 'error' ? 'error' : step.count === 0 ? 'empty' : 'success')
  return { ...step, sequence: step.sequence ?? index + 1, name: step.tool || step.name,
    status: outcome === 'error' ? 'error' : outcome === 'empty' ? 'empty' : 'ok',
    message: step.error || step.notice || (outcome === 'partial' ? '일부 자료만 확인했습니다.' : undefined),
  }
}
export function presentAgentMessage(message) {
  const allEmpty = message.steps?.length > 0 && message.steps.every(step =>
    (step.outcome || (step.status === 'error' ? 'error' : step.count === 0 ? 'empty' : 'success')) === 'empty')
  if (allEmpty) return { ...message, text: '질문하신 정보를 찾지 못했어요. 다시 검색해 주세요.', steps: [] }
  return { ...message, steps: message.steps?.map(presentToolStep) }
}
