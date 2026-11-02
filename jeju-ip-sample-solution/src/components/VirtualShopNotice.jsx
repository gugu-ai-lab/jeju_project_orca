// 체험 화면 안내 — 실제 결제·주문이 이루어지지 않음을 알린다.
export default function VirtualShopNotice({ compact = false }) {
  return (
    <div className={`shop-notice${compact ? ' is-compact' : ''}`} role="note">
      <i className="bi bi-info-circle-fill" aria-hidden="true" />
      <span><strong>체험 화면</strong>이에요. 실제 결제와 주문은 이루어지지 않고, 장바구니는 이 브라우저에만 저장돼요.</span>
    </div>
  )
}
