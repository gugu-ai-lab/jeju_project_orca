import test from 'node:test'
import assert from 'node:assert/strict'
import { getMythQuizPuzzle, evaluateQuizSubmission } from '../src/data/mythQuizPuzzles.js'
test('Gemini three-piece puzzle completes out of order, once only, without duplicates', () => {
  const config = getMythQuizPuzzle('seolmundae')
  assert.equal(config.questions.length, 3); assert.equal(config.pieces.length, 3)
  let progress = {}, completion = 0
  for (const index of [1, 0, 2]) {
    const q = config.questions[index]
    const r = evaluateQuizSubmission(config, progress, q.id, q.correctOptionId)
    progress = r.nextProgress; completion += Number(r.justCompleted)
    const duplicate = evaluateQuizSubmission(config, progress, q.id, q.correctOptionId)
    assert.equal(duplicate.newlyUnlockedPieceId, null); assert.equal(duplicate.justCompleted, false)
    assert.deepEqual(duplicate.nextProgress, progress)
  }
  assert.equal(completion, 1); assert.equal(progress.isCompleted, true)
  assert.equal(new Set(progress.unlockedPieceIds).size, 3)
})
test('wrong answer retains already opened pieces', () => {
  const config = getMythQuizPuzzle('seolmundae'), q = config.questions[0]
  const progress = evaluateQuizSubmission(config, {}, q.id, q.correctOptionId).nextProgress
  const wrong = config.questions[1]
  const r = evaluateQuizSubmission(config, progress, wrong.id, wrong.options.find(o => o.id !== wrong.correctOptionId).id)
  assert.equal(r.isCorrect, false); assert.deepEqual(r.nextProgress.unlockedPieceIds, progress.unlockedPieceIds)
})
