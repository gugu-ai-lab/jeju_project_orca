import { useEffect, useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import { getShopCart } from '../../services/browser-shop-cart'
import { mergeCartItems } from '../../services/shop-cart'

export default function ShopCartCloudSync({ showStatus = true }) {
  const items = useCartStore(state => state.items)
  const setItems = useCartStore.setState
  const [phase, setPhase] = useState('loading')

  useEffect(() => {
    let alive = true
    let cart
    try { cart = getShopCart() } catch {
      setPhase('local')
      return () => { alive = false }
    }
    cart.list().then(rows => {
      if (!alive) return
      const merged = mergeCartItems(useCartStore.getState().items, rows)
      setItems({ items: merged })
      setPhase('cloud')
      return cart.replace(merged)
    }).catch(() => {
      if (alive) setPhase('local')
    })
    return () => { alive = false }
  }, [setItems])

  useEffect(() => {
    if (phase !== 'cloud') return
    let alive = true
    const timer = setTimeout(() => {
      getShopCart().replace(items).then(() => alive && setPhase('cloud')).catch(() => alive && setPhase('local'))
    }, 350)
    return () => { alive = false; clearTimeout(timer) }
  }, [items, phase])

  if (!showStatus) return null

  return (
    <p className="small text-muted mt-2 mb-0" role="status">
      {phase === 'loading' ? '장바구니 저장 상태를 확인하고 있어요…' : phase === 'cloud' ? '장바구니가 이 기기의 익명 Supabase 계정에 저장돼요.' : '현재 브라우저에 장바구니를 저장하고 있어요.'}
    </p>
  )
}
