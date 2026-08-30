import { getGiftStoreState } from '../store/giftStore';
import type { RecipientId } from '../types/gift';

function jsonResult(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function parseRecipient(value: unknown): RecipientId | null {
  if (value === 'mom' || value === 'dad' || value === 'sister') {
    return value;
  }
  return null;
}

export interface RegisterToolsResult {
  registered: string[];
  error: string | null;
  webmcpAvailable: boolean;
}

export async function registerWebMCPTools(
  signal?: AbortSignal,
): Promise<RegisterToolsResult> {
  const modelContext = document.modelContext;

  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    return {
      registered: [],
      error: 'document.modelContext.registerTool is not available',
      webmcpAvailable: false,
    };
  }

  const registered: string[] = [];

  const tools = [
    {
      name: 'search_products',
      description:
        'Search the gift catalog. Filter by recipient (mom, dad, sister), max_price, and/or tags.',
      inputSchema: {
        type: 'object',
        properties: {
          recipient: {
            type: 'string',
            enum: ['mom', 'dad', 'sister'],
            description: 'Filter to products suggested for this recipient.',
          },
          max_price: {
            type: 'number',
            minimum: 0,
            description: 'Maximum price in USD.',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Match products whose tags contain any of these strings.',
          },
        },
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getGiftStoreState();
        const tags = Array.isArray(input.tags)
          ? input.tags.filter((t): t is string => typeof t === 'string')
          : undefined;
        const recipient = parseRecipient(input.recipient) ?? undefined;
        const max_price =
          typeof input.max_price === 'number' ? input.max_price : undefined;

        const results = store.searchProducts({ recipient, max_price, tags });
        store.recordToolActivity({ toolName: 'search_products' });
        return jsonResult({ count: results.length, products: results });
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'get_product',
      description: 'Return full details for one catalog product by id.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Product id, e.g. p1.' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getGiftStoreState();
        const id = String(input.id ?? '');
        const product = store.getProduct(id);
        store.recordToolActivity({ toolName: 'get_product', productId: id });
        if (!product) {
          return jsonResult({ error: `Product not found: ${id}` });
        }
        return jsonResult({ product });
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'stage_for_recipient',
      description:
        'Stage a product for a recipient pending human approval. Does NOT add to cart.',
      inputSchema: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'Catalog product id.' },
          recipient: {
            type: 'string',
            enum: ['mom', 'dad', 'sister'],
            description: 'Recipient to stage the gift for.',
          },
        },
        required: ['product_id', 'recipient'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getGiftStoreState();
        const productId = String(input.product_id ?? '');
        const recipient = parseRecipient(input.recipient);
        if (!recipient) {
          return jsonResult({ ok: false, error: 'Invalid recipient' });
        }
        const result = store.stageForRecipient(productId, recipient);
        store.recordToolActivity({
          toolName: 'stage_for_recipient',
          recipientId: recipient,
          productId,
        });
        return jsonResult(result);
      },
    },
    {
      name: 'get_staging_board',
      description:
        'Return the full gift board: recipients, budgets, staged pending items, and approved cart items.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getGiftStoreState();
        const board = store.getStagingBoard();
        store.recordToolActivity({ toolName: 'get_staging_board' });
        return jsonResult(board);
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'approve_staged',
      description:
        'Move a staged pending item into the approved cart for its recipient. Requires staging_id.',
      inputSchema: {
        type: 'object',
        properties: {
          staging_id: {
            type: 'string',
            description: 'The stagingId returned by stage_for_recipient.',
          },
        },
        required: ['staging_id'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getGiftStoreState();
        const stagingId = String(input.staging_id ?? '');
        const staged = store.staged.find((s) => s.stagingId === stagingId);
        const result = store.approveStaged(stagingId);
        store.recordToolActivity({
          toolName: 'approve_staged',
          recipientId: staged?.recipientId,
          productId: staged?.productId,
        });
        return jsonResult(result);
      },
    },
    {
      name: 'reject_staged',
      description: 'Remove a pending staged item without adding it to the cart.',
      inputSchema: {
        type: 'object',
        properties: {
          staging_id: {
            type: 'string',
            description: 'The stagingId to reject and remove.',
          },
        },
        required: ['staging_id'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getGiftStoreState();
        const stagingId = String(input.staging_id ?? '');
        const staged = store.staged.find((s) => s.stagingId === stagingId);
        const result = store.rejectStaged(stagingId);
        store.recordToolActivity({
          toolName: 'reject_staged',
          recipientId: staged?.recipientId,
          productId: staged?.productId,
        });
        return jsonResult(result);
      },
    },
    {
      name: 'get_budget_status',
      description:
        'Per-recipient budget: spent in cart, pending in staging, and remaining.',
      inputSchema: {
        type: 'object',
        properties: {
          recipient: {
            type: 'string',
            enum: ['mom', 'dad', 'sister'],
            description: 'Optional — omit for all recipients.',
          },
        },
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getGiftStoreState();
        const recipient = parseRecipient(input.recipient) ?? undefined;
        const status = store.getBudgetStatus(recipient);
        store.recordToolActivity({
          toolName: 'get_budget_status',
          recipientId: recipient,
        });
        return jsonResult({ budgets: status });
      },
      annotations: { readOnlyHint: true },
    },
  ];

  try {
    for (const tool of tools) {
      await modelContext.registerTool(tool, signal ? { signal } : undefined);
      registered.push(tool.name);
    }
    return { registered, error: null, webmcpAvailable: true };
  } catch (err) {
    return {
      registered,
      error: err instanceof Error ? err.message : String(err),
      webmcpAvailable: true,
    };
  }
}

/** Dev harness: invoke a tool handler without WebMCP (same code path as execute). */
export async function invokeToolLocally(
  name: string,
  args: Record<string, unknown> = {},
): Promise<string> {
  const modelContext = document.modelContext;
  if (modelContext) {
    const tools = await modelContext.getTools();
    const tool = tools.find((t) => t.name === name);
    if (tool) {
      try {
        return await modelContext.executeTool(tool, JSON.stringify(args));
      } catch {
        return await modelContext.executeTool(tool, args);
      }
    }
  }

  // Fallback: re-register is heavy; call store directly for judge testing
  const store = getGiftStoreState();
  switch (name) {
    case 'search_products': {
      const tags = Array.isArray(args.tags)
        ? args.tags.filter((t): t is string => typeof t === 'string')
        : undefined;
      const recipient =
        parseRecipient(args.recipient) ?? undefined;
      const max_price =
        typeof args.max_price === 'number' ? args.max_price : undefined;
      const products = store.searchProducts({ recipient, max_price, tags });
      store.recordToolActivity({ toolName: name });
      return jsonResult({ count: products.length, products });
    }
    case 'get_product': {
      const id = String(args.id ?? '');
      const product = store.getProduct(id);
      store.recordToolActivity({ toolName: name, productId: id });
      return jsonResult(product ? { product } : { error: `Not found: ${id}` });
    }
    case 'stage_for_recipient': {
      const productId = String(args.product_id ?? '');
      const recipient = parseRecipient(args.recipient);
      if (!recipient) return jsonResult({ ok: false, error: 'Invalid recipient' });
      const result = store.stageForRecipient(productId, recipient);
      store.recordToolActivity({
        toolName: name,
        recipientId: recipient,
        productId,
      });
      return jsonResult(result);
    }
    case 'get_staging_board': {
      store.recordToolActivity({ toolName: name });
      return jsonResult(store.getStagingBoard());
    }
    case 'approve_staged': {
      const stagingId = String(args.staging_id ?? '');
      const staged = store.staged.find((s) => s.stagingId === stagingId);
      const result = store.approveStaged(stagingId);
      store.recordToolActivity({
        toolName: name,
        recipientId: staged?.recipientId,
        productId: staged?.productId,
      });
      return jsonResult(result);
    }
    case 'reject_staged': {
      const stagingId = String(args.staging_id ?? '');
      const staged = store.staged.find((s) => s.stagingId === stagingId);
      const result = store.rejectStaged(stagingId);
      store.recordToolActivity({
        toolName: name,
        recipientId: staged?.recipientId,
        productId: staged?.productId,
      });
      return jsonResult(result);
    }
    case 'get_budget_status': {
      const recipient = parseRecipient(args.recipient) ?? undefined;
      store.recordToolActivity({ toolName: name, recipientId: recipient });
      return jsonResult({ budgets: store.getBudgetStatus(recipient) });
    }
    default:
      return jsonResult({ error: `Unknown tool: ${name}` });
  }
}
