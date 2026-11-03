import test from 'node:test'
import assert from 'node:assert/strict'
import { createShopCartService, mergeCartItems, SHOP_CART_TABLE } from '../services/shop-cart.js'
import { FAVORITES_PROJECT_URL } from '../services/supabase-session.js'

function fakeClient() {
  const calls = []
  const client = {
    supabaseUrl: FAVORITES_PROJECT_URL,
    from(table) {
      calls.push(['from', table])
      const query = {
        select(columns) { calls.push(['select', columns]); return this },
        upsert(rows, options) { calls.push(['upsert', rows, options]); return this },
        delete() { calls.push(['delete']); return this },
        eq(column, value) { calls.push(['eq', column, value]); return this },
        not(column, operator, value) { calls.push(['not', column, operator, value]); return this },
        then(resolve) { resolve({ data: [], error: null }) },
      }
      return query
    },
  }
  return { client, calls }
}

test('initial cart merge preserves local and remote items without adding duplicate quantities', () => {
  assert.deepEqual(mergeCartItems({ a: 2, localOnly: 1, invalid: -2 }, [
    { product_id: 'a', quantity: 4 }, { product_id: 'remoteOnly', quantity: 3 },
    { product_id: 'bad', quantity: 12 },
  ]), { a: 4, localOnly: 1, remoteOnly: 3 })
})

test('cloud cart reads and writes only within the current anonymous user', async () => {
  const { client, calls } = fakeClient()
  const sessions = []
  const service = createShopCartService(client, { ensureSession: async () => {
    sessions.push(true)
    return { userId: 'user-a', isAnonymous: true }
  } })
  assert.deepEqual(await service.list(), [])
  await service.replace({ 'product-a': 2 })
  assert.equal(calls.some(call => call[0] === 'from' && call[1] === SHOP_CART_TABLE), true)
  assert.equal(calls.some(call => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'user-a'), true)
  assert.deepEqual(calls.find(call => call[0] === 'upsert')[1], [{
    user_id: 'user-a', product_id: 'product-a', quantity: 2, updated_at: calls.find(call => call[0] === 'upsert')[1][0].updated_at,
  }])
  assert.equal(sessions.length, 2)
})

test('cloud cart rejects another Supabase project', () => {
  assert.throws(() => createShopCartService({ supabaseUrl: 'https://other.supabase.co', from() {} }), error => error.code === 'WRONG_PROJECT')
})
