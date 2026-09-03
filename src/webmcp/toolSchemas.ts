/**
 * Parameter schemas for every WebMCP tool, in one place.
 *
 * These were previously inline in registerTools.ts only, so TOOL_MANIFEST — and
 * therefore /api/v1/tools and the agent runner — advertised 18 tools with NO
 * parameters. Frontier models correctly called add_to_order({}) because the
 * schema we handed them said the tool took no arguments. Two of five failed the
 * shopping task for that reason alone.
 *
 * Generated from registerTools.ts; scripts/verify-tool-schemas.mjs fails the
 * build if the two ever drift apart.
 */
import type { WebMCPToolName } from './toolManifest';

export const TOOL_SCHEMAS: Record<WebMCPToolName, Record<string, unknown>> = {
  search_catalog: {
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
  get_product: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Product SKU id. `product_id` and `sku` are accepted too.' },
    },
    required: ['id'],
    additionalProperties: false,
  },
  add_to_order: {
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
  update_line_quantity: {
    type: 'object',
    properties: {
      line_id: { type: 'string' },
      quantity: { type: 'integer', minimum: 0, maximum: 99 },
    },
    required: ['line_id', 'quantity'],
    additionalProperties: false,
  },
  remove_line: {
    type: 'object',
    properties: { line_id: { type: 'string' } },
    required: ['line_id'],
    additionalProperties: false,
  },
  get_order: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  get_delivery_quote: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  prepare_checkout: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  get_readiness_score: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  get_merchant_config: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  create_coshop_room: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  export_shopify_catalog: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  validate_catalog_feed: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  apply_readiness_fix: {
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
  simulate_agent_journey: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  import_shopify_catalog: {
    type: 'object',
    properties: {
      feed: { type: 'object', description: 'Shopify Catalog export JSON' },
      store_id: { type: 'string' },
      store_name: { type: 'string' },
    },
    required: ['feed'],
    additionalProperties: false,
  },
  get_field_companion: {
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
  review_against_field: {
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
};
