import { PRODUCTS } from '../data/catalog';
import { useShopStore } from '../store/shopStore';

export function ShopView() {
  const addToOrder = useShopStore((s) => s.addToOrder);
  const order = useShopStore((s) => s.order);

  const inOrder = (productId: string) =>
    order.lines.some((l) => l.productId === productId);

  return (
    <section className="shop" aria-label="Product catalog">
      <h2>Catalog</h2>
      <p className="shop__hint">
        You and your agent share one order. Add items here or via WebMCP tools.
      </p>
      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <article
            key={product.id}
            className={`product-card${!product.inStock ? ' product-card--oos' : ''}`}
          >
            <div className="product-card__meta">
              <span className="product-card__category">{product.category}</span>
              {!product.inStock && (
                <span className="product-card__badge">Out of stock</span>
              )}
            </div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="product-card__footer">
              <strong>${product.price.toFixed(2)}</strong>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!product.inStock}
                onClick={() => addToOrder(product.id, 1, 'human')}
              >
                {inOrder(product.id) ? 'Add another' : 'Add to order'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
