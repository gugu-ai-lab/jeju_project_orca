import { formatWon } from '../lib/cart'
import { productImage } from '../lib/pixelProducts'
import { storySymbol } from '../lib/pixelSymbols'

// 상품 카드 — 표현 전용.
export default function ProductCard({ product, inCart = 0, onAdd }) {
  const art = productImage(product.id) || storySymbol(product.symbol) // 상품 그림이 없으면 이야기 상징으로 대체
  return (
    <article className="product-card">
      <div className="product-art" style={art ? { background: art.bg } : undefined} aria-hidden="true">
        {art && <span className="story-symbol" style={{ backgroundImage: art.url }} />}
      </div>
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.desc}</p>
        <div className="product-foot">
          <strong className="product-price">{formatWon(product.price)}</strong>
          <button type="button" className="btn btn-citrus btn-sm" onClick={() => onAdd(product.id)} aria-label={`${product.name} 장바구니에 담기`}>
            <i className="bi bi-bag-plus me-1" aria-hidden="true" />담기{inCart > 0 && <span className="product-incart"> · {inCart}개 담김</span>}
          </button>
        </div>
      </div>
    </article>
  )
}
