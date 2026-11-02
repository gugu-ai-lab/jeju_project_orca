// 가상 상점 안내 — 실제 판매·결제가 아님을 분명히 알린다.
export default function VirtualShopNotice({ compact = false }) {
  return (
    <div className={`shop-notice${compact ? ' is-compact' : ''}`} role="note">
      <i className="bi bi-info-circle-fill" aria-hidden="true" />
      <span><strong>체험용 가상 상점</strong>이에요. 상품은 실제로 팔지 않고, 결제도 주문도 만들어지지 않아요. 장바구니는 이 브라우저에만 저장돼요.</span>
    </div>
  )
}
