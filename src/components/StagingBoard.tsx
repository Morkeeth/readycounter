import { memo, useEffect, useMemo, useState } from 'react';
import { PRODUCTS, RECIPIENTS } from '../data/catalog';
import { useGiftStore } from '../store/giftStore';
import type { Product, RecipientId } from '../types/gift';

function productPrice(productId: string): number {
  return PRODUCTS.find((p) => p.id === productId)?.price ?? 0;
}

interface ItemCardProps {
  product: Product;
  stagingId?: string;
  variant: 'staged' | 'cart';
  onApprove?: () => void;
  onReject?: () => void;
}

function ItemCard({
  product,
  stagingId,
  variant,
  onApprove,
  onReject,
}: ItemCardProps) {
  return (
    <article
      className={`item-card item-card--${variant}`}
      data-staging-id={stagingId}
    >
      <div className="item-card__header">
        <h4>{product.name}</h4>
        <span className="item-card__price">${product.price}</span>
      </div>
      <p className="item-card__desc">{product.description}</p>
      <div className="item-card__tags">
        {product.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      {variant === 'staged' && onApprove && onReject && (
        <div className="item-card__actions">
          <button type="button" className="btn btn--approve" onClick={onApprove}>
            Approve
          </button>
          <button type="button" className="btn btn--reject" onClick={onReject}>
            Reject
          </button>
        </div>
      )}
    </article>
  );
}

interface BudgetBarProps {
  budget: number;
  cartSpent: number;
  stagedPending: number;
}

const BudgetBar = memo(function BudgetBar({
  budget,
  cartSpent,
  stagedPending,
}: BudgetBarProps) {
  const cartPct = Math.min(100, (cartSpent / budget) * 100);
  const stagedPct = Math.min(100 - cartPct, (stagedPending / budget) * 100);
  const remaining = budget - cartSpent - stagedPending;

  return (
    <div className="budget-bar">
      <div className="budget-bar__track">
        <div
          className="budget-bar__fill budget-bar__fill--cart"
          style={{ width: `${cartPct}%` }}
        />
        <div
          className="budget-bar__fill budget-bar__fill--staged"
          style={{ width: `${stagedPct}%`, left: `${cartPct}%` }}
        />
      </div>
      <div className="budget-bar__labels">
        <span>${cartSpent} cart</span>
        <span>${stagedPending} staged</span>
        <span className={remaining < 0 ? 'over-budget' : ''}>
          ${remaining} left
        </span>
      </div>
    </div>
  );
});

interface RecipientColumnProps {
  recipientId: RecipientId;
  name: string;
  budget: number;
  flash?: boolean;
}

function RecipientColumn({
  recipientId,
  name,
  budget,
  flash,
}: RecipientColumnProps) {
  const allStaged = useGiftStore((s) => s.staged);
  const allCart = useGiftStore((s) => s.cart);
  const approveStaged = useGiftStore((s) => s.approveStaged);
  const rejectStaged = useGiftStore((s) => s.rejectStaged);
  const recordToolActivity = useGiftStore((s) => s.recordToolActivity);

  const staged = useMemo(
    () => allStaged.filter((item) => item.recipientId === recipientId),
    [allStaged, recipientId],
  );
  const cart = useMemo(
    () => allCart.filter((item) => item.recipientId === recipientId),
    [allCart, recipientId],
  );
  const { cartSpent, stagedPending } = useMemo(() => {
    const spent = cart.reduce((sum, item) => sum + productPrice(item.productId), 0);
    const pending = staged.reduce(
      (sum, item) => sum + productPrice(item.productId),
      0,
    );
    return { cartSpent: spent, stagedPending: pending };
  }, [cart, staged]);

  const handleApprove = (stagingId: string, productId: string) => {
    approveStaged(stagingId);
    recordToolActivity({
      toolName: 'approve_staged (human)',
      recipientId,
      productId,
    });
  };

  const handleReject = (stagingId: string, productId: string) => {
    rejectStaged(stagingId);
    recordToolActivity({
      toolName: 'reject_staged (human)',
      recipientId,
      productId,
    });
  };

  return (
    <section
      className={`recipient-column${flash ? ' recipient-column--flash' : ''}`}
      data-recipient={recipientId}
    >
      <header className="recipient-column__header">
        <h2>{name}</h2>
        <span className="recipient-column__budget">Budget ${budget}</span>
      </header>

      <BudgetBar
        budget={budget}
        cartSpent={cartSpent}
        stagedPending={stagedPending}
      />

      <div className="tray tray--staging">
        <h3>
          Staging <span className="tray-badge tray-badge--pending">pending</span>
        </h3>
        {staged.length === 0 ? (
          <p className="tray-empty">No staged items — agent proposes here.</p>
        ) : (
          <ul className="tray-list">
            {staged.map((item) => {
              const product = PRODUCTS.find((p) => p.id === item.productId);
              if (!product) return null;
              return (
                <li key={item.stagingId}>
                  <ItemCard
                    product={product}
                    stagingId={item.stagingId}
                    variant="staged"
                    onApprove={() =>
                      handleApprove(item.stagingId, item.productId)
                    }
                    onReject={() =>
                      handleReject(item.stagingId, item.productId)
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="tray tray--cart">
        <h3>
          Cart <span className="tray-badge tray-badge--approved">approved</span>
        </h3>
        {cart.length === 0 ? (
          <p className="tray-empty">Nothing approved yet.</p>
        ) : (
          <ul className="tray-list">
            {cart.map((item) => {
              const product = PRODUCTS.find((p) => p.id === item.productId);
              if (!product) return null;
              return (
                <li key={item.cartId}>
                  <ItemCard product={product} variant="cart" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export function StagingBoard() {
  const lastActivity = useGiftStore((s) => s.lastToolActivity);
  const [flashRecipient, setFlashRecipient] = useState<RecipientId | null>(null);

  useEffect(() => {
    if (!lastActivity?.recipientId) return;
    setFlashRecipient(lastActivity.recipientId);
    const timer = window.setTimeout(() => setFlashRecipient(null), 1200);
    return () => window.clearTimeout(timer);
  }, [lastActivity?.timestamp, lastActivity?.recipientId]);

  return (
    <div className="staging-board">
      {RECIPIENTS.map((recipient) => (
        <RecipientColumn
          key={recipient.id}
          recipientId={recipient.id}
          name={recipient.name}
          budget={recipient.budget}
          flash={flashRecipient === recipient.id}
        />
      ))}
    </div>
  );
}
