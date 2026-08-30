export type RecipientId = 'mom' | 'dad' | 'sister';

export interface Recipient {
  id: RecipientId;
  name: string;
  budget: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  suggestedRecipients: RecipientId[];
}

export interface StagedItem {
  stagingId: string;
  productId: string;
  recipientId: RecipientId;
  status: 'pending';
  stagedAt: number;
}

export interface CartItem {
  cartId: string;
  productId: string;
  recipientId: RecipientId;
  approvedAt: number;
  fromStagingId: string;
}

export interface BudgetStatus {
  recipientId: RecipientId;
  name: string;
  budget: number;
  cartSpent: number;
  stagedPending: number;
  remaining: number;
}

export interface StagingBoard {
  recipients: Recipient[];
  staged: StagedItem[];
  cart: CartItem[];
  products: Product[];
}

export interface ToolActivity {
  toolName: string;
  timestamp: number;
  recipientId?: RecipientId;
  productId?: string;
}
