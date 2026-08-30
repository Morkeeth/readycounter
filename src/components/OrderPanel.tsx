import { useState } from 'react';
import { ShareCoShopBar } from './ShareCoShopBar';
import { useShopStore } from '../store/shopStore';

export function OrderPanel() {
  const order = useShopStore((s) => s.getOrder());
  const lines = useShopStore((s) => s.order.lines);
  const updateLineQuantity = useShopStore((s) => s.updateLineQuantity);
  const removeLine = useShopStore((s) => s.removeLine);
  const prepareCheckout = useShopStore((s) => s.prepareCheckout);
  const getProduct = useShopStore((s) => s.getProduct);
  const delivery = useShopStore((s) => s.getDeliveryQuote());
  const merchant = useShopStore((s) => s.merchant);

  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);

  const handleCheckout = () => {
    const result = prepareCheckout('human');
    if (result.blocked) {
      setCheckoutMsg(result.reason ?? 'Checkout blocked');
    } else {
      setCheckoutMsg(
        `Ready for human payment — ${result.lineCount} items, $${result.subtotal?.toFixed(2)} subtotal.`,
      );
    }
  };

  const blockedPreview =
    merchant.checkoutRequiresCaptcha || merchant.checkoutRequiresAccount;

  return (
    <section className="order-panel" aria-label="Shared co-shop order">
      <h2>Co-shop order</h2>
      <p className="order-panel__hint">
        65% trust AI to compare prices. 14% trust it to buy alone. You stay in
        the tab.
      </p>

      {lines.length === 0 ? (
        <p className="order-panel__empty">No items yet — you or your agent can add.</p>
      ) : (
        <ul className="order-lines">
          {lines.map((line) => {
            const product = getProduct(line.productId);
            if (!product) return null;
            return (
              <li key={line.lineId} className="order-line">
                <div>
                  <strong>{product.name}</strong>
                  <span className={`order-line__actor order-line__actor--${line.addedBy}`}>
                    {line.addedBy}
                  </span>
                </div>
                <div className="order-line__controls">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() =>
                      updateLineQuantity(line.lineId, line.quantity - 1, 'human')
                    }
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() =>
                      updateLineQuantity(line.lineId, line.quantity + 1, 'human')
                    }
                  >
                    +
                  </button>
                  <span className="order-line__price">
                    ${(product.price * line.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => removeLine(line.lineId, 'human')}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ShareCoShopBar />

      <div className="order-summary">
        <div>
          <span>Subtotal</span>
          <strong>${order.subtotal.toFixed(2)}</strong>
        </div>
        <div>
          <span>Shipping</span>
          <strong>
            {delivery.price === 0 ? 'Free' : `$${delivery.price.toFixed(2)}`}
          </strong>
        </div>
        <div className="order-summary__total">
          <span>Total</span>
          <strong>${(order.subtotal + delivery.price).toFixed(2)}</strong>
        </div>
      </div>

      {blockedPreview && (
        <p className="order-panel__blocked" role="status">
          Agent checkout likely blocked — fix in Merchant → Readiness.
        </p>
      )}

      {checkoutMsg && (
        <p className={checkoutMsg.includes('blocked') ? 'order-panel__blocked' : 'order-panel__ok'}>
          {checkoutMsg}
        </p>
      )}

      <button
        type="button"
        className="btn btn--primary btn--wide"
        disabled={order.lineCount === 0}
        onClick={handleCheckout}
      >
        Prepare checkout (human confirms)
      </button>
    </section>
  );
}
