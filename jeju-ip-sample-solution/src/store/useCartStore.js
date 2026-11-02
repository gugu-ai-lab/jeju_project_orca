import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addItem, removeItem, sanitizeItems, setQty } from '../lib/cart'
import { getProduct } from '../data/shopProducts'

// 장바구니 상태 — 새 저장소 파일(다른 저장소와 독립). 이 브라우저(localStorage)에만 저장하고 서버·Supabase 는 쓰지 않는다.
export const useCartStore = create(persist((set, get) => ({
  items: {},
  lastAdded: null, // { name, at } — "담았어요" 알림용
  add: (id) => {
    const p = getProduct(id); if (!p) return
    const at = Date.now()
    set({ items: addItem(get().items, id), lastAdded: { name: p.name, at } })
    setTimeout(() => { if (get().lastAdded?.at === at) set({ lastAdded: null }) }, 2800)
  },
  setQty: (id, qty) => set({ items: setQty(get().items, id, qty) }),
  remove: (id) => set({ items: removeItem(get().items, id) }),
  clear: () => set({ items: {} }),
  dismissNotice: () => set({ lastAdded: null }),
}), {
  name: 'jeju-cart-v1',
  version: 1,
  partialize: (s) => ({ items: s.items }),
  merge: (persisted, current) => ({ ...current, items: sanitizeItems(persisted?.items) }), // 깨진 저장값은 버린다
}))
