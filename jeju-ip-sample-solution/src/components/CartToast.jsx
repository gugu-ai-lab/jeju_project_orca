import { Link } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'

// "담았어요" 알림 — 스토어의 lastAdded 가 바뀔 때마다 잠깐 나타난다(몇 초 뒤 스토어가 스스로 지운다).
export default function CartToast() {
  const last = useCartStore((s) => s.lastAdded)
  const dismiss = useCartStore((s) => s.dismissNotice)
  if (!last) return null
  return (
    <div className="cart-toast" role="status" key={last.at}>
      <i className="bi bi-bag-check me-2" aria-hidden="true" />
      <span><strong>{last.name}</strong>을(를) 담았어요</span>
      <Link to="/cart" className="btn btn-citrus btn-sm ms-2" onClick={dismiss}>장바구니</Link>
      <button type="button" className="btn-close-px" onClick={dismiss} aria-label="알림 닫기"><i className="bi bi-x-lg" aria-hidden="true" /></button>
    </div>
  )
}
