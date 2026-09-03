import { getFieldCompanionPayload, reviewAgainstField } from '../data/field-companion';
import { getStore, registerCustomStore } from '../data/stores';
import { apiCreateRoom } from '../api/client';
import {
  importShopifyFeed,
  toShopifyCatalog,
  validateStoreCatalog,
  type ShopifyCatalogExport,
} from '../integrations/shopify-catalog';
import { simulateAgentJourney } from '../lib/agent-journey';
import type { AutopilotFix } from '../lib/autopilot';
import { computeReadinessChecks, readinessScore } from '../lib/readiness';
import { getShopStoreState, useShopStore } from '../store/shopStore';
import { WEBMCP_TOOL_COUNT } from './toolManifest';

function jsonResult(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export interface RegisterToolsResult {
  registered: string[];
  error: string | null;
  webmcpAvailable: boolean;
}

/**
 * Read a product identifier under any of the names an agent might reasonably use.
 *
 * Found by pointing a real model at these tools: get_product takes `id`, but
 * add_to_order took `product_id`. The model called get_product({id}), got a
 * product back, carried `id` forward to add_to_order, and looped six times on
 * "Product not found:". Our own tool surface was inconsistent enough to trap an
 * agent — on a product whose whole thesis is making stores legible to agents.
 *
 * Rather than rename and break anyone already integrated, every product-taking
 * tool now reads all three spellings, and the error names what it expected.
 */
function readProductId(input: Record<string, unknown>): string {
  for (const key of ['product_id', 'id', 'sku', 'productId']) {
    const v = input[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
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
        properties: {
          id: { type: 'string', description: 'Product SKU id. `product_id` and `sku` are accepted too.' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const id = readProductId(input);
        const product = store.getProduct(id);
        store.recordToolActivity({ toolName: 'get_product', productId: id });
        store.recordFunnel('product_view', 'agent', id);
        if (!product) return jsonResult({ ok: false, error: id ? `Not found: ${id}` : 'Missing product id — pass product_id (or id / sku) from search_catalog.' });
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
          product_id: {
            type: 'string',
            description: 'Product SKU id, as returned by search_catalog. `id` and `sku` are accepted too.',
          },
          quantity: { type: 'integer', minimum: 1, maximum: 99, default: 1 },
        },
        required: ['product_id'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const productId = readProductId(input);
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
        const products = store.getCatalogProducts();
        const checks = computeReadinessChecks(store.merchant, WEBMCP_TOOL_COUNT, products);
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
    {
      name: 'apply_readiness_fix',
      description:
        'Autopilot: apply a readiness fix — disable_captcha, disable_account_wall, or sync_feed_prices. Returns score before/after.',
      inputSchema: {
        type: 'object',
        properties: {
          fix: {
            type: 'string',
            enum: ['disable_captcha', 'disable_account_wall', 'sync_feed_prices'],
          },
        },
        required: ['fix'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const fix = String(input.fix ?? '') as AutopilotFix;
        const result = store.applyReadinessFix(fix);
        store.recordToolActivity({ toolName: 'apply_readiness_fix' });
        return jsonResult(result);
      },
    },
    {
      name: 'simulate_agent_journey',
      description:
        'Simulate full agent path: search → get_product → add_to_order → get_order → prepare_checkout. Returns per-step pass/fail.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        const store = getShopStoreState();
        const journey = simulateAgentJourney(store, WEBMCP_TOOL_COUNT);
        store.recordToolActivity({ toolName: 'simulate_agent_journey' });
        return jsonResult(journey);
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'import_shopify_catalog',
      description:
        'Import Shopify Catalog JSON as a new store. Persists in browser; switches to imported store.',
      inputSchema: {
        type: 'object',
        properties: {
          feed: { type: 'object', description: 'Shopify Catalog export JSON' },
          store_id: { type: 'string' },
          store_name: { type: 'string' },
        },
        required: ['feed'],
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        const feed = input.feed as ShopifyCatalogExport;
        const def = importShopifyFeed(feed, {
          storeId: typeof input.store_id === 'string' ? input.store_id : undefined,
          name: typeof input.store_name === 'string' ? input.store_name : undefined,
        });
        registerCustomStore(def);
        store.switchStore(def.id);
        store.recordToolActivity({ toolName: 'import_shopify_catalog' });
        return jsonResult({
          ok: true,
          storeId: def.id,
          name: def.name,
          productCount: def.products.length,
        });
      },
    },
    {
      name: 'get_field_companion',
      description:
        'Field companion handbook: pressing agent-commerce issues, merchant checklist, research briefs (R1–R6), protocol cheatsheet. Optional topic filter.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description:
              'all | issues | checklist | research | protocols | issue id (e.g. gtin-gap) | rank number',
          },
        },
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        store.recordToolActivity({ toolName: 'get_field_companion' });
        const topic = typeof input.topic === 'string' ? input.topic : undefined;
        return jsonResult(getFieldCompanionPayload(topic));
      },
      annotations: { readOnlyHint: true },
    },
    {
      name: 'review_against_field',
      description:
        'Review crawl/readiness signals against the field handbook. Returns matching pressing issues and do-this-week steps.',
      inputSchema: {
        type: 'object',
        properties: {
          gtinPct: { type: 'number' },
          catalogScore: { type: 'number' },
          captchaHint: { type: 'boolean' },
          productsJsonOk: { type: 'boolean' },
          accountWall: { type: 'boolean' },
          error: { type: 'string' },
        },
        additionalProperties: false,
      },
      execute: (input: Record<string, unknown>) => {
        const store = getShopStoreState();
        store.recordToolActivity({ toolName: 'review_against_field' });
        return jsonResult(
          reviewAgainstField({
            gtinPct: typeof input.gtinPct === 'number' ? input.gtinPct : undefined,
            catalogScore: typeof input.catalogScore === 'number' ? input.catalogScore : undefined,
            captchaHint: input.captchaHint === true,
            productsJsonOk:
              typeof input.productsJsonOk === 'boolean' ? input.productsJsonOk : undefined,
            accountWall: input.accountWall === true,
            error: typeof input.error === 'string' ? input.error : undefined,
          }),
        );
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
      const id = readProductId(args);
      const product = store.getProduct(id);
      store.recordToolActivity({ toolName: name, productId: id });
      return jsonResult(product ? { product } : { ok: false, error: id ? `Not found: ${id}` : 'Missing product id — pass product_id (or id / sku) from search_catalog.' });
    }
    case 'add_to_order': {
      const productId = readProductId(args);
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
      const products = store.getCatalogProducts();
      const checks = computeReadinessChecks(store.merchant, WEBMCP_TOOL_COUNT, products);
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
    case 'apply_readiness_fix': {
      const fix = String(args.fix ?? '') as AutopilotFix;
      const result = store.applyReadinessFix(fix);
      store.recordToolActivity({ toolName: name });
      return jsonResult(result);
    }
    case 'simulate_agent_journey': {
      store.recordToolActivity({ toolName: name });
      return jsonResult(simulateAgentJourney(store, WEBMCP_TOOL_COUNT));
    }
    case 'import_shopify_catalog': {
      const feed = args.feed as ShopifyCatalogExport;
      const def = importShopifyFeed(feed, {
        storeId: typeof args.store_id === 'string' ? args.store_id : undefined,
        name: typeof args.store_name === 'string' ? args.store_name : undefined,
      });
      registerCustomStore(def);
      store.switchStore(def.id);
      store.recordToolActivity({ toolName: name });
      return jsonResult({
        ok: true,
        storeId: def.id,
        productCount: def.products.length,
      });
    }
    case 'get_field_companion': {
      store.recordToolActivity({ toolName: name });
      return jsonResult(
        getFieldCompanionPayload(typeof args.topic === 'string' ? args.topic : undefined),
      );
    }
    case 'review_against_field': {
      store.recordToolActivity({ toolName: name });
      return jsonResult(
        reviewAgainstField({
          gtinPct: typeof args.gtinPct === 'number' ? args.gtinPct : undefined,
          catalogScore: typeof args.catalogScore === 'number' ? args.catalogScore : undefined,
          captchaHint: args.captchaHint === true,
          productsJsonOk: typeof args.productsJsonOk === 'boolean' ? args.productsJsonOk : undefined,
          accountWall: args.accountWall === true,
          error: typeof args.error === 'string' ? args.error : undefined,
        }),
      );
    }
    default:
      return jsonResult({ error: `Unknown tool: ${name}` });
  }
}
