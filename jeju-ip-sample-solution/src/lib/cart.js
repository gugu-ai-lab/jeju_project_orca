// 장바구니 계산 — 화면과 무관한 순수 함수. 가상 상점이라 실제 결제·주문·재고는 없다.
// items 는 { [상품 id]: 수량 } 형태의 평평한 객체다.
export const SHIPPING_FEE = 3000
export const FREE_SHIPPING_FROM = 30000
export const MAX_QTY = 9

export const formatWon = (n) => `${Math.round(Number(n) || 0).toLocaleString('ko-KR')}원`

const clampQty = (q) => Math.min(MAX_QTY, Math.max(0, Math.floor(Number(q) || 0)))

// 저장돼 있던 값(localStorage 등)을 믿지 않고 정리한다: 정수 1~MAX_QTY 만 남긴다.
export function sanitizeItems(raw) {
  const out = {}
  if (raw && typeof raw === 'object') for (const [id, q] of Object.entries(raw)) { const n = clampQty(q); if (n > 0) out[id] = n }
  return out
}

export function addItem(items, id, qty = 1) {
  return { ...items, [id]: clampQty((items[id] || 0) + qty) }
}
export function setQty(items, id, qty) {
  const n = clampQty(qty)
  if (n === 0) return removeItem(items, id)
  return { ...items, [id]: n }
}
export function removeItem(items, id) {
  const { [id]: _removed, ...rest } = items
  return rest
}
export const countItems = (items) => Object.values(items).reduce((s, q) => s + q, 0)

// products: [{ id, name, price }]. 목록에 없는 id 는 무시한다(상품이 바뀌어도 장바구니가 깨지지 않게).
export function summarize(items, products) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const lines = []
  for (const [id, qty] of Object.entries(items)) {
    const product = byId.get(id); if (!product || qty <= 0) continue
    lines.push({ product, qty, lineTotal: product.price * qty })
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
  return { lines, count, subtotal, shipping, total: subtotal + shipping, freeShippingRemaining: subtotal === 0 ? FREE_SHIPPING_FROM : Math.max(0, FREE_SHIPPING_FROM - subtotal) }
}
