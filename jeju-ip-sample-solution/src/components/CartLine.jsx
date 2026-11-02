import { MAX_QTY, formatWon } from '../lib/cart'
import { storySymbol } from '../lib/pixelSymbols'

// 장바구니 한 줄 — 표현 전용. 수량 조절과 삭제는 props 로 받는다.
export default function CartLine({ product, qty, lineTotal, onQty, onRemove }) {
  const art = storySymbol(product.symbol)
  return (
    <li className="cart-line">
      <span className="cart-art" style={art ? { background: art.bg } : undefined} aria-hidden="true">{art && <span className="story-symbol" style={{ backgroundImage: art.url }} />}</span>
      <div className="cart-info">
        <strong className="cart-name">{product.name}</strong>
        <span className="cart-unit">{formatWon(product.price)} <span className="text-secondary">× {qty}</span></span>
        <div className="qty-stepper" role="group" aria-label={`${product.name} 수량`}>
          <button type="button" className="btn btn-outline-sea btn-sm" onClick={() => onQty(product.id, qty - 1)} aria-label="수량 줄이기"><i className="bi bi-dash" aria-hidden="true" /></button>
          <output className="qty-value" aria-live="polite">{qty}</output>
          <button type="button" className="btn btn-outline-sea btn-sm" disabled={qty >= MAX_QTY} onClick={() => onQty(product.id, qty + 1)} aria-label="수량 늘리기"><i className="bi bi-plus" aria-hidden="true" /></button>
        </div>
      </div>
      <div className="cart-side">
        <strong className="cart-total">{formatWon(lineTotal)}</strong>
        <button type="button" className="btn btn-outline-sea btn-sm" onClick={() => onRemove(product.id)} aria-label={`${product.name} 빼기`}><i className="bi bi-trash" aria-hidden="true" /> 빼기</button>
      </div>
    </li>
  )
}
