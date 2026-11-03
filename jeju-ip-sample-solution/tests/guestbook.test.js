import test from 'node:test'
import assert from 'node:assert/strict'
import { createGuestbookService, GuestbookError, GUESTBOOK_TABLE } from '../services/guestbook.js'
import { FAVORITES_PROJECT_URL } from '../services/supabase-session.js'

function fakeClient({ listResult = { data: [] }, insertResult = { data: { id: 'post-1', nickname: '바다별', message: '안녕 제주!', created_at: '2026-11-03T00:00:00Z' } } } = {}) {
  const calls = []
  return {
    calls,
    client: {
      supabaseUrl: FAVORITES_PROJECT_URL,
      from(table) {
        calls.push(['from', table])
        return {
          select(columns) { calls.push(['select', columns]); return this },
          order(column, options) { calls.push(['order', column, options]); return this },
          limit(value) { calls.push(['limit', value]); return Promise.resolve(listResult) },
          insert(values) {
            calls.push(['insert', values])
            return { select: columns => ({ single: async () => { calls.push(['returning', columns]); return insertResult } }) }
          },
        }
      },
    },
  }
}

test('public guestbook list is newest first and capped at fifty records', async () => {
  const { client, calls } = fakeClient({ listResult: { data: [{ id: 'p1', nickname: '별', message: '글', created_at: '2026-11-03' }] } })
  const service = createGuestbookService(client)
  const rows = await service.list(500)
  assert.deepEqual(rows, [{ id: 'p1', nickname: '별', message: '글', createdAt: '2026-11-03' }])
  assert.deepEqual(calls.at(-1), ['limit', 50])
})

test('guestbook insert creates an anonymous session first and sends only nickname and message', async () => {
  const { client, calls } = fakeClient()
  let ensured = false
  const service = createGuestbookService(client, { ensureSession: async () => { ensured = true } })
  const post = await service.add({ nickname: ' 바다별 ', message: ' 안녕 제주! ' })
  assert.equal(ensured, true)
  assert.deepEqual(calls.find(call => call[0] === 'insert'), ['insert', { nickname: '바다별', message: '안녕 제주!' }])
  assert.equal(post.nickname, '바다별')
  assert.equal('authorId' in post, false)
})

test('invalid guestbook input is rejected before authentication or insert', async () => {
  const { client, calls } = fakeClient()
  let ensured = false
  const service = createGuestbookService(client, { ensureSession: async () => { ensured = true } })
  await assert.rejects(service.add({ nickname: '   ', message: '글' }), error => error.code === 'INVALID_POST')
  await assert.rejects(service.add({ nickname: '별', message: '글', authorId: 'forged' }), error => error.code === 'INVALID_POST')
  assert.equal(ensured, false)
  assert.deepEqual(calls, [])
})

test('missing table, cooldown and database errors are reported safely', async () => {
  const missing = fakeClient({ listResult: { error: { code: 'PGRST205', message: 'private response' } } })
  await assert.rejects(createGuestbookService(missing.client).list(), error => error.code === 'TABLE_NOT_READY' && !error.message.includes('private'))
  const limited = fakeClient({ insertResult: { error: { code: 'P0001', message: 'guestbook_rate_limit' } } })
  await assert.rejects(createGuestbookService(limited.client).add({ nickname: '별', message: '글' }), error => error.code === 'RATE_LIMITED')
  assert.throws(() => createGuestbookService({ supabaseUrl: 'https://other.supabase.co' }), error => error instanceof GuestbookError)
  assert.equal(GUESTBOOK_TABLE, 'jeju_guestbook')
})
