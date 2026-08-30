import { useState } from 'react';
import { ShareCoShopBar } from './ShareCoShopBar';
import { getSource } from '../data/sources';
import { useShopStore } from '../store/shopStore';

export function OrderPanel() {
  /*
   * Subscribe to STATE, derive outside the selector.
   *
   * `useShopStore((s) => s.getOrder())` builds a fresh object on every call, so
   * useSyncExternalStore saw a new snapshot each pass and React tore the tab
   * down with error #185 (maximum update depth). The Shop tab white-screened on
   * main at dd90f26 — the co-shop flow, i.e. the demo. Selectors below return
   * stable references; the totals are computed during render, driven by `lines`.
   */
  const lines = useShopStore((s) => s.order.lines);
  const getOrder = useShopStore((s) => s.getOrder);
  const getDeliveryQuote = useShopStore((s) => s.getDeliveryQuote);
  const updateLineQuantity = useShopStore((s) => s.updateLineQuantity);
  const removeLine = useShopStore((s) => s.removeLine);
  const prepareCheckout = useShopStore((s) => s.prepareCheckout);
  const getProduct = useShopStore((s) => s.getProduct);
  const merchant = useShopStore((s) => s.merchant);

  const order = getOrder();
  const delivery = getDeliveryQuote();

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
        {getSource('yougov_trust_gap').claim} That gap is the product: the agent
        proposes, you pay.
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

      {/* An empty order must not quote $6.50 shipping on a $0 total — the
          delivery rule only applies once there is something to deliver. */}
      <div className="order-summary">
        <div>
          <span>Subtotal</span>
          <strong>${order.subtotal.toFixed(2)}</strong>
        </div>
        <div>
          <span>Shipping</span>
          <strong>
            {order.lineCount === 0
              ? '—'
              : delivery.price === 0
                ? 'Free'
                : `$${delivery.price.toFixed(2)}`}
          </strong>
        </div>
        <div className="order-summary__total">
          <span>Total</span>
          <strong>
            ${(order.lineCount === 0 ? 0 : order.subtotal + delivery.price).toFixed(2)}
          </strong>
        </div>
      </div>

      {blockedPreview && (
        <div className="order-panel__blocked" role="status">
          <strong>Will void</strong>
          {merchant.checkoutRequiresCaptcha
            ? `A CAPTCHA sits on this checkout. ${getSource('presenc_captcha').claim}`
            : 'A forced account sits on this checkout. It closes the same door as a CAPTCHA, and ReadyCounter charges it the same 24 readiness points.'}{' '}
          <a href={getSource('presenc_captcha').url} target="_blank" rel="noreferrer">
            {getSource('presenc_captcha').publisher}
          </a>
          , read {getSource('presenc_captcha').accessed}. Clear it in Merchant
          readiness and the tape reprints 24 points higher.
        </div>
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
