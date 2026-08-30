import { getStore } from '../data/stores';
import { apiCreateRoom } from '../api/client';
import {
  toShopifyCatalog,
  validateStoreCatalog,
} from '../integrations/shopify-catalog';
import { computeReadinessChecks, readinessScore } from '../lib/readiness';
import { getShopStoreState, useShopStore } from '../store/shopStore';

const TOOL_COUNT = 13;

function jsonResult(value: unknown): string {
  return JSON.stringify(value, null, 2);
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
      name: 'search_catalog',
      description:
        'Search the store catalog by query, category, max_price, or in_stock_only. Returns structured product records for agent discovery.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text search.' },
          category: {
            type: 'string',
            enum: [
              'beans',
              'kits',
              'equipment',
              'beverages',
              'merch',
              'subscription',
              'powder',
            ],
          },
          max_price: { type: 'number', minimum: 0 },
          in_stock_only: { type: 'boolean' },
        },
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const results = store.searchCatalog({
          query: typeof input.query === 'string' ? input.query : undefined,
          category: typeof input.category === 'string' ? input.category : undefined,
          max_price: typeof input.max_price === 'number' ? input.max_price : undefined,
          in_stock_only: input.in_stock_only === true,
        });
        store.recordToolActivity({ toolName: 'search_catalog' });
        store.recordFunnel('catalog_search', 'agent');
        return jsonResult({
          count: results.length,
          products: results.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            inStock: p.inStock,
            category: p.category,
          })),
        });
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'get_product',
      description: 'Return full structured product details by SKU id.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const id = String(input.id ?? '');
        const product = store.getProduct(id);
        store.recordToolActivity({ toolName: 'get_product', productId: id });
        store.recordFunnel('product_view', 'agent', id);
        if (!product) return jsonResult({ error: `Not found: ${id}` });
        return jsonResult({ product });
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'add_to_order',
      description:
        'Add a product to the shared co-shop order. Human and agent see the same order. Does not complete checkout.',
      inputSchema: {
        type: 'object',
        properties: {
          product_id: { type: 'string' },
          quantity: { type: 'integer', minimum: 1, maximum: 99, default: 1 },
        },
        required: ['product_id'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const productId = String(input.product_id ?? '');
        const quantity =
          typeof input.quantity === 'number' ? Math.floor(input.quantity) : 1;
        const result = store.addToOrder(productId, quantity, 'agent');
        store.recordToolActivity({ toolName: 'add_to_order', productId });
        return jsonResult(result);
      },
    },
    {
      name: 'update_line_quantity',
      description: 'Update quantity on an existing order line in the shared co-shop order.',
      inputSchema: {
        type: 'object',
        properties: {
          line_id: { type: 'string' },
          quantity: { type: 'integer', minimum: 0, maximum: 99 },
        },
        required: ['line_id', 'quantity'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const lineId = String(input.line_id ?? '');
        const quantity = typeof input.quantity === 'number' ? input.quantity : 0;
        const result = store.updateLineQuantity(lineId, quantity, 'agent');
        store.recordToolActivity({ toolName: 'update_line_quantity' });
        return jsonResult(result);
      },
    },
    {
      name: 'remove_line',
      description: 'Remove a line from the shared co-shop order.',
      inputSchema: {
        type: 'object',
        properties: { line_id: { type: 'string' } },
        required: ['line_id'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const lineId = String(input.line_id ?? '');
        const result = store.removeLine(lineId, 'agent');
        store.recordToolActivity({ toolName: 'remove_line' });
        return jsonResult(result);
      },
    },
    {
      name: 'get_order',
      description:
        'Return the current shared order: lines, quantities, subtotal. Same state the human sees.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getShopStoreState();
        const order = store.getOrder();
        const lines = order.lines.map((line) => {
          const product = store.getProduct(line.productId);
          return {
            ...line,
            productName: product?.name,
            unitPrice: product?.price,
            lineTotal: (product?.price ?? 0) * line.quantity,
          };
        });
        store.recordToolActivity({ toolName: 'get_order' });
        return jsonResult({ ...order, lines });
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'get_delivery_quote',
      description: 'Return shipping quote for the current order. Read-only.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getShopStoreState();
        store.recordToolActivity({ toolName: 'get_delivery_quote' });
        return jsonResult(store.getDeliveryQuote());
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'prepare_checkout',
      description:
        'Validate the order for checkout. Returns blocked if merchant config prevents agent checkout (e.g. CAPTCHA). Human must complete payment in UI.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getShopStoreState();
        const result = store.prepareCheckout('agent');
        store.recordToolActivity({ toolName: 'prepare_checkout' });
        return jsonResult(result);
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'get_readiness_score',
      description:
        'Return merchant agent-readiness score /100 and per-check breakdown for the active store.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getShopStoreState();
        const def = getStore(store.storeId);
        const checks = computeReadinessChecks(store.merchant, TOOL_COUNT, def.products);
        store.recordToolActivity({ toolName: 'get_readiness_score' });
        return jsonResult({
          storeId: store.storeId,
          storeName: def.name,
          score: readinessScore(checks),
          checks,
        });
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'get_merchant_config',
      description:
        'Return active merchant checkout flags (CAPTCHA, account required) and store metadata.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getShopStoreState();
        const def = getStore(store.storeId);
        store.recordToolActivity({ toolName: 'get_merchant_config' });
        return jsonResult({
          storeId: store.storeId,
          name: def.name,
          checkoutRequiresCaptcha: store.merchant.checkoutRequiresCaptcha,
          checkoutRequiresAccount: store.merchant.checkoutRequiresAccount,
        });
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'create_coshop_room',
      description:
        'Create a live API-backed co-shop room. Returns roomId and share URL — human and agent sync via /api/v1/rooms (deployed).',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: async () => {
        const store = getShopStoreState();
        const created = await apiCreateRoom(store.storeId, store.merchant);
        store.recordToolActivity({ toolName: 'create_coshop_room' });
        if (!created) {
          return jsonResult({
            ok: false,
            error: 'Room API unavailable — deploy to Vercel or use copy co-shop link.',
          });
        }
        const url = new URL(window.location.href);
        url.searchParams.set('room', created.roomId);
        url.searchParams.set('store', store.storeId);
        useShopStore.setState({
          order: created.state.order,
          merchant: created.state.merchant,
          funnel: created.state.funnel,
        });
        return jsonResult({
          ok: true,
          roomId: created.roomId,
          url: url.toString(),
        });
      },
    },
    {
      name: 'export_shopify_catalog',
      description:
        'Export active store catalog as Shopify Catalog JSON for agent feeds and partner integrations.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getShopStoreState();
        const feed = toShopifyCatalog(store.storeId);
        store.recordToolActivity({ toolName: 'export_shopify_catalog' });
        return jsonResult(feed);
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'validate_catalog_feed',
      description:
        'Validate Shopify-shaped catalog feed for agent readiness (GTIN, variants, prices).',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getShopStoreState();
        const result = validateStoreCatalog(store.storeId);
        store.recordToolActivity({ toolName: 'validate_catalog_feed' });
        return jsonResult({ storeId: store.storeId, ...result });
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

  const store = getShopStoreState();
  switch (name) {
    case 'search_catalog': {
      const results = store.searchCatalog({
        query: typeof args.query === 'string' ? args.query : undefined,
        category: typeof args.category === 'string' ? args.category : undefined,
        max_price: typeof args.max_price === 'number' ? args.max_price : undefined,
        in_stock_only: args.in_stock_only === true,
      });
      store.recordToolActivity({ toolName: name });
      store.recordFunnel('catalog_search', 'agent');
      return jsonResult({ count: results.length, products: results });
    }
    case 'get_product': {
      const id = String(args.id ?? '');
      const product = store.getProduct(id);
      store.recordToolActivity({ toolName: name, productId: id });
      return jsonResult(product ? { product } : { error: `Not found: ${id}` });
    }
    case 'add_to_order': {
      const productId = String(args.product_id ?? '');
      const quantity = typeof args.quantity === 'number' ? args.quantity : 1;
      const result = store.addToOrder(productId, quantity, 'agent');
      store.recordToolActivity({ toolName: name, productId });
      return jsonResult(result);
    }
    case 'update_line_quantity': {
      const result = store.updateLineQuantity(
        String(args.line_id ?? ''),
        typeof args.quantity === 'number' ? args.quantity : 0,
        'agent',
      );
      store.recordToolActivity({ toolName: name });
      return jsonResult(result);
    }
    case 'remove_line': {
      const result = store.removeLine(String(args.line_id ?? ''), 'agent');
      store.recordToolActivity({ toolName: name });
      return jsonResult(result);
    }
    case 'get_order': {
      store.recordToolActivity({ toolName: name });
      return jsonResult(store.getOrder());
    }
    case 'get_delivery_quote': {
      store.recordToolActivity({ toolName: name });
      return jsonResult(store.getDeliveryQuote());
    }
    case 'prepare_checkout': {
      store.recordToolActivity({ toolName: name });
      return jsonResult(store.prepareCheckout('agent'));
    }
    case 'get_readiness_score': {
      const def = getStore(store.storeId);
      const checks = computeReadinessChecks(store.merchant, TOOL_COUNT, def.products);
      store.recordToolActivity({ toolName: name });
      return jsonResult({
        storeId: store.storeId,
        score: readinessScore(checks),
        checks,
      });
    }
    case 'get_merchant_config': {
      const def = getStore(store.storeId);
      store.recordToolActivity({ toolName: name });
      return jsonResult({
        storeId: store.storeId,
        name: def.name,
        checkoutRequiresCaptcha: store.merchant.checkoutRequiresCaptcha,
        checkoutRequiresAccount: store.merchant.checkoutRequiresAccount,
      });
    }
    case 'export_shopify_catalog': {
      store.recordToolActivity({ toolName: name });
      return jsonResult(toShopifyCatalog(store.storeId));
    }
    case 'validate_catalog_feed': {
      store.recordToolActivity({ toolName: name });
      return jsonResult({ storeId: store.storeId, ...validateStoreCatalog(store.storeId) });
    }
    case 'create_coshop_room': {
      store.recordToolActivity({ toolName: name });
      const created = await apiCreateRoom(store.storeId, store.merchant);
      if (!created) {
        return jsonResult({ ok: false, error: 'Room API unavailable' });
      }
      return jsonResult({ ok: true, roomId: created.roomId });
    }
    default:
      return jsonResult({ error: `Unknown tool: ${name}` });
  }
}
