import { createShopCartService } from './shop-cart.js'
import { ensureMythFavoritesSession, getMythSupabaseClient, isSupabasePreviewReadOnly } from './browser-favorites.js'

let shared

export function getShopCart() {
  if (isSupabasePreviewReadOnly()) throw new Error('안전 미리보기에서는 장바구니 클라우드 동기화를 실행하지 않습니다.')
  if (!shared) shared = createShopCartService(getMythSupabaseClient(), { ensureSession: ensureMythFavoritesSession })
  return shared
}
