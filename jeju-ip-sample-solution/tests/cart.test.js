import test from 'node:test'
import assert from 'node:assert/strict'
import { FREE_SHIPPING_FROM, MAX_QTY, SHIPPING_FEE, addItem, countItems, formatWon, removeItem, sanitizeItems, setQty, summarize } from '../src/lib/cart.js'
import { PRODUCTS } from '../src/data/shopProducts.js'

const P = [{ id: 'a', name: 'A', price: 4500 }, { id: 'b', name: 'B', price: 12000 }]

test('prices are whole won and ids are unique', () => {
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length)
  for (const p of PRODUCTS) { assert.ok(Number.isInteger(p.price) && p.price > 0, p.id); assert.ok(p.name && p.desc && p.symbol, p.id) }
})

test('add, set and remove keep quantities valid', () => {
  let items = addItem({}, 'a'); items = addItem(items, 'a', 2); assert.deepEqual(items, { a: 3 })
  assert.equal(addItem({ a: MAX_QTY }, 'a').a, MAX_QTY)               // 상한
  assert.deepEqual(setQty({ a: 3 }, 'a', 0), {})                       // 0 이하는 삭제
  assert.deepEqual(setQty({ a: 3 }, 'a', -2), {})
  assert.deepEqual(setQty({ a: 3 }, 'a', 2.9), { a: 2 })               // 정수로 내림
  assert.deepEqual(setQty({ a: 1 }, 'a', 99), { a: MAX_QTY })
  assert.deepEqual(removeItem({ a: 1, b: 2 }, 'a'), { b: 2 })
  assert.equal(countItems({ a: 2, b: 3 }), 5)
})

test('summarize computes line totals, subtotal and shipping', () => {
  const s = summarize({ a: 2, b: 1 }, P)
  assert.equal(s.subtotal, 21000); assert.equal(s.shipping, SHIPPING_FEE); assert.equal(s.total, 24000)
  assert.equal(s.count, 3); assert.equal(s.freeShippingRemaining, FREE_SHIPPING_FROM - 21000)
  assert.deepEqual(s.lines.map((l) => l.lineTotal), [9000, 12000])
})

test('shipping is free at the threshold and for an empty cart', () => {
  const free = summarize({ b: 3 }, P); assert.equal(free.subtotal, 36000); assert.equal(free.shipping, 0); assert.equal(free.total, 36000); assert.equal(free.freeShippingRemaining, 0)
  const exact = summarize({ a: 1, b: 2 }, [{ id: 'a', name: 'A', price: 6000 }, { id: 'b', name: 'B', price: 12000 }]); assert.equal(exact.subtotal, 30000); assert.equal(exact.shipping, 0)
  const empty = summarize({}, P); assert.equal(empty.total, 0); assert.equal(empty.shipping, 0)
})

test('unknown products and bad stored values are ignored', () => {
  assert.equal(summarize({ zzz: 5, a: 1 }, P).subtotal, 4500)
  assert.deepEqual(sanitizeItems({ a: '3', b: -1, c: 'x', d: 99, e: 1.7, f: null }), { a: 3, d: MAX_QTY, e: 1 })
  assert.deepEqual(sanitizeItems(null), {}); assert.deepEqual(sanitizeItems('oops'), {})
})

test('formatWon groups thousands in Korean format', () => {
  assert.equal(formatWon(0), '0원'); assert.equal(formatWon(4500), '4,500원'); assert.equal(formatWon(1234567), '1,234,567원'); assert.equal(formatWon('abc'), '0원')
})
