import { useEffect } from 'react';
import { getStore } from '../data/stores';
import { catalogJsonLd } from '../lib/catalogSchema';
import { useShopStore } from '../store/shopStore';

export function ShopView() {
  const addToOrder = useShopStore((s) => s.addToOrder);
  const order = useShopStore((s) => s.order);
  const storeId = useShopStore((s) => s.storeId);
  const store = getStore(storeId);
  const products = store.products;

  useEffect(() => {
    const id = 'readycounter-catalog-jsonld';
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = id;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(catalogJsonLd(store.name, products));
  }, [store.name, products]);

  const inOrder = (productId: string) =>
    order.lines.some((l) => l.productId === productId);

  return (
    <section className="shop" aria-label="Product catalog">
      <h2>Catalog</h2>
      <p className="shop__hint">
        You and your agent share one order. Add items here or via WebMCP tools.
      </p>
      <div className="product-grid">
        {products.map((product) => (
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
