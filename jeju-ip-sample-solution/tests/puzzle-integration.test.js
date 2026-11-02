import test from 'node:test'
import assert from 'node:assert/strict'
import { MYTH_QUIZ_PUZZLES, getMythQuizPuzzle, evaluateQuizSubmission } from '../src/data/mythQuizPuzzles.js'
import { STORY_CATALOG } from '../src/data/storyCatalog.js'
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

test('all seven story detail records have three evidence-based questions and matching puzzle pieces', () => {
  const storyIds = ['seolmundae', 'samsinin', 'honinji', 'jacheongbi', 'suwolbong', 'sanbangdeok', 'yeongdeung']
  assert.deepEqual(Object.keys(MYTH_QUIZ_PUZZLES).sort(), [...storyIds].sort())
  for (const storyId of storyIds) {
    assert.ok(STORY_CATALOG.some(story => story.id === storyId), `${storyId} remains in story catalog`)
    const config = getMythQuizPuzzle(storyId)
    assert.equal(config.questions.length, 3, `${storyId} has three questions`)
    assert.equal(config.pieces.length, 3, `${storyId} has three pieces`)
    assert.equal(config.grid.totalPieces, 3)
    assert.equal(new Set(config.questions.map(question => question.id)).size, 3)
    assert.equal(new Set(config.pieces.map(piece => piece.pieceId)).size, 3)
    for (const question of config.questions) {
      assert.equal(question.options.length, 3)
      assert.equal(new Set(question.options.map(option => option.text)).size, 3)
      assert.ok(question.options.some(option => option.id === question.correctOptionId))
      assert.ok(question.pieceId)
      assert.match(question.evidence, /CSV|csv/)
      assert.ok(config.pieces.some(piece => piece.questionId === question.id && piece.pieceId === question.pieceId))
    }
  }
})

test('each myth awards exactly one piece per correct answer and never awards one for a wrong answer', () => {
  const storyIds = ['seolmundae', 'samsinin', 'honinji', 'jacheongbi', 'suwolbong', 'sanbangdeok', 'yeongdeung']
  for (const storyId of storyIds) {
    const config = getMythQuizPuzzle(storyId)
    let progress = {}
    const wrong = config.questions[0]
    const wrongOption = wrong.options.find(option => option.id !== wrong.correctOptionId)
    const wrongResult = evaluateQuizSubmission(config, progress, wrong.id, wrongOption.id)
    assert.equal(wrongResult.isCorrect, false, `${storyId} rejects a wrong answer`)
    assert.equal(wrongResult.newlyUnlockedPieceId, null)
    assert.deepEqual(wrongResult.nextProgress.unlockedPieceIds, [])

    let completionCount = 0
    for (const question of [config.questions[2], config.questions[0], config.questions[1]]) {
      const result = evaluateQuizSubmission(config, progress, question.id, question.correctOptionId)
      progress = result.nextProgress
      completionCount += Number(result.justCompleted)
      assert.equal(result.newlyUnlockedPieceId, question.pieceId, `${storyId} opens its mapped area`)
    }
    assert.equal(progress.isCompleted, true, `${storyId} completes after three correct answers`)
    assert.equal(new Set(progress.unlockedPieceIds).size, 3)
    assert.equal(completionCount, 1)
  }
})

test('all seven story puzzles use their second shared pixel-art scene', () => {
  for (const storyId of ['seolmundae', 'samsinin', 'honinji', 'jacheongbi', 'suwolbong', 'sanbangdeok', 'yeongdeung']) {
    assert.equal(getMythQuizPuzzle(storyId).artwork.src, `/myth-pixel/${storyId}-scene-02-pixel-16x9.jpg`)
    assert.equal(getMythQuizPuzzle(storyId).artwork.width, 1376)
    assert.equal(getMythQuizPuzzle(storyId).artwork.height, 768)
  }
  assert.equal(getMythQuizPuzzle('unknown'), null)
})
