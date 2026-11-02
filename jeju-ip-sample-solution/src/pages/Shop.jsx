import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import VirtualShopNotice from '../components/VirtualShopNotice'
import { PRODUCTS } from '../data/shopProducts'
import { formatWon, summarize } from '../lib/cart'
import { useCartStore } from '../store/useCartStore'

// 기념품 가게 — 상품을 장바구니에 담는 화면. 결제는 없다.
export default function Shop() {
  const items = useCartStore((s) => s.items)
  const add = useCartStore((s) => s.add)
  const sum = summarize(items, PRODUCTS)
  return (
    <>
      <PageHeader title="탐라 기념품 가게" subtitle="이야기 속 장면을 닮은 도트 기념품을 장바구니에 담아 보세요" />
      <VirtualShopNotice />
      <Row className="g-3 mt-1">
        {PRODUCTS.map((p) => (
          <Col key={p.id} xs={12} sm={6} lg={4}><ProductCard product={p} inCart={items[p.id] || 0} onAdd={add} /></Col>
        ))}
      </Row>
      <div className="cart-bar surface" role="status">
        <span>{sum.count > 0 ? <>장바구니 <strong>{sum.count}개</strong> · 상품금액 <strong>{formatWon(sum.subtotal)}</strong></> : '장바구니가 비어 있어요'}</span>
        <Link to="/cart" className="btn btn-primary btn-sm"><i className="bi bi-bag me-1" aria-hidden="true" />장바구니 보기</Link>
      </div>
    </>
  )
}
