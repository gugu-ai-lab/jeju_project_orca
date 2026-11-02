import test from 'node:test'
import assert from 'node:assert/strict'
import { favoriteInput, createFavoritesSlice } from '../services/favorites-presentation.js'
const row = { id: 'row', storyId: 'seolmundae', storyTitle: '설문대할망', createdAt: '2026-11-02' }
function state(service) {
  let s = { toast() {} }
  s = { ...s, ...createFavoritesSlice(p => Object.assign(s, p), () => s, service) }
  return s
}
test('story and legacy place cards use stable separate identifiers and no ownership fields', () => {
  assert.deepEqual(favoriteInput({ storyId: 'seolmundae', storyTitle: '설문대할망', userId: 'forged' }), { storyId: 'seolmundae', storyTitle: '설문대할망' })
  assert.equal(favoriteInput({ source: 'tour', id: 12, title: '장소' }).storyId, 'tour:12')
  assert.throws(() => favoriteInput({ source: 'unknown', id: 1 }))
})
test('save, duplicate, reload and delete use the injected service without any network', async () => {
  let rows = []
  const service = { save: async () => { const created = rows.length === 0; rows = [row]; return { favorite: row, created } }, list: async () => [...rows], remove: async () => { rows = []; return { deleted: true } } }
  const first = state(service)
  await first.addFavorite({ storyId: 'seolmundae', storyTitle: '설문대할망' })
  await first.addFavorite({ storyId: 'seolmundae', storyTitle: '설문대할망' })
  assert.equal(first.favorites.length, 1)
  const refreshed = state(service); await refreshed.loadFavorites()
  assert.deepEqual(refreshed.favorites, [row])
  await refreshed.removeFavorite('seolmundae'); assert.deepEqual(refreshed.favorites, [])
})
test('toggle saves an unsaved favorite and cancels it on the next press', async () => {
  let rows = []
  const service = {
    save: async input => { const saved = { ...row, storyId: input.storyId, storyTitle: input.storyTitle }; rows = [saved]; return { favorite: saved, created: true } },
    remove: async storyId => { rows = rows.filter(item => item.storyId !== storyId); return { deleted: true } },
    list: async () => [...rows],
  }
  const s = state(service)
  assert.equal(await s.toggleFavorite({ storyId: 'tour:123', storyTitle: '관광지' }), true)
  assert.equal(s.favorites[0].storyId, 'tour:123')
  assert.equal(await s.toggleFavorite({ storyId: 'tour:123', storyTitle: '관광지' }), true)
  assert.deepEqual(s.favorites, [])
})
test('failed delete retains visible rows; unknown raw errors are not exposed', async () => {
  const s = state({ list: async () => [row], remove: async () => { throw new Error('private upstream detail') } })
  await s.loadFavorites(); assert.equal(await s.removeFavorite('seolmundae'), false)
  assert.equal(s.favorites.length, 1); assert.doesNotMatch(s.favError, /private/)
})
