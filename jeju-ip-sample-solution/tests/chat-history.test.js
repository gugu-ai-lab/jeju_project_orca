import test from 'node:test'
import assert from 'node:assert/strict'
import { addAskedQuestion, MAX_SAVED_QUESTIONS, normalizeAskedQuestions } from '../src/lib/chatHistory.js'

test('saved questions are trimmed, newest first and deduplicated', () => {
  const first = addAskedQuestion([], '  자청비 이야기는?  ', 1000)
  const second = addAskedQuestion(first, '자청비 이야기는?', 2000)
  assert.equal(second.length, 1)
  assert.equal(second[0].question, '자청비 이야기는?')
  assert.equal(second[0].askedAt, new Date(2000).toISOString())
})

test('question history is capped and rejects empty or malformed storage', () => {
  let history = []
  for (let i = 0; i < MAX_SAVED_QUESTIONS + 5; i++) history = addAskedQuestion(history, `질문 ${i}`, i + 1)
  assert.equal(history.length, MAX_SAVED_QUESTIONS)
  assert.equal(history[0].question, `질문 ${MAX_SAVED_QUESTIONS + 4}`)
  assert.equal(addAskedQuestion(history, '   ', 99).length, MAX_SAVED_QUESTIONS)
  assert.deepEqual(normalizeAskedQuestions({ bad: true }), [])
})
