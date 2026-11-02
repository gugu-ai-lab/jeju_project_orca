export const MAX_SAVED_QUESTIONS = 30
const MAX_QUESTION_LENGTH = 300

export function normalizeAskedQuestions(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter(item => item && typeof item.question === 'string' && typeof item.askedAt === 'string')
    .slice(0, MAX_SAVED_QUESTIONS)
    .map((item, index) => ({
      id: typeof item.id === 'string' ? item.id : `saved-${index}`,
      question: item.question.trim().slice(0, MAX_QUESTION_LENGTH),
      askedAt: item.askedAt,
    }))
    .filter(item => item.question)
}

export function addAskedQuestion(history, value, now = Date.now()) {
  const question = typeof value === 'string' ? value.trim().slice(0, MAX_QUESTION_LENGTH) : ''
  if (!question) return normalizeAskedQuestions(history)
  const askedAt = new Date(now).toISOString()
  const id = `${now}-${question.slice(0, 24)}`
  const existing = normalizeAskedQuestions(history).filter(item => item.question !== question)
  return [{ id, question, askedAt }, ...existing].slice(0, MAX_SAVED_QUESTIONS)
}
