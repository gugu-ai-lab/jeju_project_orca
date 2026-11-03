import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PENDING_FAVORITE_TRANSFER_KEY,
  clearFavoriteTransfer,
  normalizeFavoriteTransfer,
  readFavoriteTransfer,
  storeFavoriteTransfer,
} from '../services/account-favorite-transfer.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  }
}

test('favorite transfer stores only validated identifiers and titles, then can be cleared', () => {
  const storage = memoryStorage()
  assert.equal(storeFavoriteTransfer(storage, [
    { storyId: ' myth:1 ', storyTitle: ' 이야기 1 ' },
    { storyId: '', storyTitle: '잘못된 행' },
  ]), 1)
  assert.deepEqual(readFavoriteTransfer(storage), [{ storyId: 'myth:1', storyTitle: '이야기 1' }])
  clearFavoriteTransfer(storage)
  assert.equal(storage.getItem(PENDING_FAVORITE_TRANSFER_KEY), null)
})

test('favorite transfer ignores malformed data and limits the copied payload', () => {
  const storage = memoryStorage()
  assert.deepEqual(normalizeFavoriteTransfer('not rows'), [])
  storage.setItem(PENDING_FAVORITE_TRANSFER_KEY, '{broken')
  assert.deepEqual(readFavoriteTransfer(storage), [])
  assert.equal(storage.getItem(PENDING_FAVORITE_TRANSFER_KEY), null)
  assert.equal(normalizeFavoriteTransfer(Array.from({ length: 120 }, (_, index) => ({ storyId: `id-${index}`, storyTitle: '이야기' }))).length, 100)
})
