import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import CartLine from '../components/CartLine'
import PageHeader from '../components/PageHeader'
import { PRODUCTS } from '../data/shopProducts'
import { FREE_SHIPPING_FROM, formatWon, summarize } from '../lib/cart'
import { useCartStore } from '../store/useCartStore'
import ShopCartCloudSync from '../components/ShopCartCloudSync'

// 장바구니 — 담은 상품과 가격 합계를 보여준다. "결제하기"는 체험용 안내만 띄우고 아무것도 보내거나 저장하지 않는다.
export default function Cart() {
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const [tried, setTried] = useState(false)
  const sum = summarize(items, PRODUCTS)
  const progress = Math.min(100, Math.round((sum.subtotal / FREE_SHIPPING_FROM) * 100))

  return (
    <>
      <PageHeader title="장바구니" subtitle="담은 기념품과 가격을 확인해 보세요" />
      <ShopCartCloudSync showStatus={false} />
      {sum.lines.length === 0 ? (
        <div className="story-empty mt-3 text-center py-4">
          <i className="bi bi-bag me-2" aria-hidden="true" />장바구니가 비어 있어요.
          <div className="mt-3"><Link to="/shop" className="btn btn-primary btn-sm">기념품 보러 가기</Link></div>
        </div>
      ) : (
        <Row className="g-3 mt-1">
          <Col lg={8}>
            <ul className="cart-list surface">
              {sum.lines.map((l) => <CartLine key={l.product.id} product={l.product} qty={l.qty} lineTotal={l.lineTotal} onQty={setQty} onRemove={remove} />)}
            </ul>
            <div className="d-flex justify-content-between mt-2">
              <Link to="/shop" className="btn btn-outline-sea btn-sm"><i className="bi bi-arrow-left me-1" aria-hidden="true" />계속 둘러보기</Link>
              <button type="button" className="btn btn-outline-sea btn-sm" onClick={() => { clear(); setTried(false) }}><i className="bi bi-x-circle me-1" aria-hidden="true" />모두 비우기</button>
            </div>
          </Col>
          <Col lg={4}>
            <aside className="cart-summary surface" aria-label="결제 예상 금액">
              <h2 className="h5">예상 금액</h2>
              <dl className="cart-rows">
                <div><dt>상품금액 ({sum.count}개)</dt><dd>{formatWon(sum.subtotal)}</dd></div>
                <div><dt>배송비</dt><dd>{sum.shipping === 0 ? '무료' : formatWon(sum.shipping)}</dd></div>
                <div className="cart-grand"><dt>총 금액</dt><dd>{formatWon(sum.total)}</dd></div>
              </dl>
              <div className="ship-meter" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
              <p className="small mb-3">{sum.freeShippingRemaining > 0 ? `${formatWon(sum.freeShippingRemaining)} 더 담으면 배송비가 무료예요` : '무료 배송 조건을 채웠어요'}</p>
              <button type="button" className="btn btn-citrus w-100" onClick={() => setTried(true)}><i className="bi bi-credit-card me-1" aria-hidden="true" />결제하기 (체험)</button>
              {tried && <p className="shop-notice is-compact mt-3 mb-0" role="alert"><i className="bi bi-exclamation-circle-fill" aria-hidden="true" /><span>체험 화면이라 <strong>결제는 진행되지 않아요.</strong> 주문도 만들어지지 않았고, 아무 정보도 전송하지 않았어요.</span></p>}
            </aside>
          </Col>
        </Row>
      )}
    </>
  )
}
