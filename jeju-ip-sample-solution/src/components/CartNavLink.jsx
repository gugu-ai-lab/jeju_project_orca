import { NavLink } from 'react-router-dom'
import { countItems } from '../lib/cart'
import { useCartStore } from '../store/useCartStore'

// 상단 메뉴의 장바구니 버튼 — 담긴 개수를 배지로 보여준다.
export default function CartNavLink() {
  const count = useCartStore((s) => countItems(s.items))
  return (
    <NavLink to="/cart" className="nav-link cart-nav" aria-label={`장바구니, 담긴 상품 ${count}개`} title={`장바구니 (${count})`}>
      <i className="bi bi-bag" aria-hidden="true" />
      {count > 0 && <span className="cart-badge" aria-hidden="true">{count}</span>}
    </NavLink>
  )
}
