import { FAVORITES_PROJECT_URL, FavoritesError } from './supabase-session.js'
import { sanitizeItems } from '../src/lib/cart.js'

export const SHOP_CART_TABLE = 'jeju_shop_cart_items'

export class ShopCartError extends Error {
  constructor(code, message = '장바구니를 클라우드에 저장하지 못했어요.') {
    super(message)
    this.name = 'ShopCartError'
    this.code = code
  }
}

export function mergeCartItems(localItems, remoteRows = []) {
  const merged = { ...sanitizeItems(localItems) }
  for (const row of remoteRows) {
    if (typeof row?.product_id !== 'string') continue
    const quantity = Number(row.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9) continue
    merged[row.product_id] = Math.max(merged[row.product_id] || 0, quantity)
  }
  return merged
}

export function createShopCartService(client, { ensureSession = async () => {} } = {}) {
  if (!client || client.supabaseUrl !== FAVORITES_PROJECT_URL || typeof client.from !== 'function') {
    throw new ShopCartError('WRONG_PROJECT')
  }
  return {
    async list() {
      const session = await ensureSession()
      const { data, error } = await client.from(SHOP_CART_TABLE).select('product_id, quantity').eq('user_id', session.userId)
      if (error) throw new ShopCartError(error.code === 'PGRST205' ? 'TABLE_NOT_READY' : 'READ_FAILED')
      return Array.isArray(data) ? data : []
    },
    async replace(items) {
      const session = await ensureSession()
      const safe = sanitizeItems(items)
      const rows = Object.entries(safe).map(([product_id, quantity]) => ({
        user_id: session.userId,
        product_id,
        quantity,
        updated_at: new Date().toISOString(),
      }))
      if (rows.length) {
        const { error } = await client.from(SHOP_CART_TABLE).upsert(rows, { onConflict: 'user_id,product_id' })
        if (error) throw new ShopCartError('WRITE_FAILED')
      }
      let query = client.from(SHOP_CART_TABLE).delete().eq('user_id', session.userId)
      if (Object.keys(safe).length) query = query.not('product_id', 'in', `(${Object.keys(safe).map(id => `"${id.replaceAll('"', '')}"`).join(',')})`)
      const { error } = await query
      if (error) throw new ShopCartError('WRITE_FAILED')
    },
  }
}

export function isShopCartSetupError(error) {
  return error instanceof FavoritesError || error instanceof ShopCartError
}
