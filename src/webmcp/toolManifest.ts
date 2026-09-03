/** WebMCP tool catalog — shared by registerTools and /api/v1/tools */
import { TOOL_SCHEMAS } from './toolSchemas';

export const WEBMCP_TOOL_COUNT = 18;

export const WEBMCP_TOOL_NAMES = [
  'search_catalog',
  'get_product',
  'add_to_order',
  'update_line_quantity',
  'remove_line',
  'get_order',
  'get_delivery_quote',
  'prepare_checkout',
  'get_readiness_score',
  'get_merchant_config',
  'create_coshop_room',
  'export_shopify_catalog',
  'validate_catalog_feed',
  'apply_readiness_fix',
  'simulate_agent_journey',
  'import_shopify_catalog',
  'get_field_companion',
  'review_against_field',
] as const;

export type WebMCPToolName = (typeof WEBMCP_TOOL_NAMES)[number];

export interface ToolManifestEntry {
  name: WebMCPToolName;
  description: string;
  readOnly?: boolean;
  /** The tool's real parameter schema. Without it a client cannot call the tool. */
  inputSchema?: Record<string, unknown>;
}

export const TOOL_MANIFEST: ToolManifestEntry[] = [
  {
    name: 'search_catalog',
    description: 'Search catalog by query, category, max_price, in_stock_only.',
    readOnly: true,
  },
  { name: 'get_product', description: 'Full product record by SKU id.', readOnly: true },
  { name: 'add_to_order', description: 'Add to shared co-shop order (no payment).' },
  { name: 'update_line_quantity', description: 'Update line quantity in shared order.' },
  { name: 'remove_line', description: 'Remove a line from shared order.' },
  { name: 'get_order', description: 'Current shared order + subtotal.', readOnly: true },
  { name: 'get_delivery_quote', description: 'Shipping quote for current order.', readOnly: true },
  {
    name: 'prepare_checkout',
    description: 'Validate checkout; blocked if CAPTCHA/account wall.',
    readOnly: true,
  },
  {
    name: 'get_readiness_score',
    description: 'Merchant readiness /100 + per-check breakdown.',
    readOnly: true,
  },
  { name: 'get_merchant_config', description: 'Checkout flags + store metadata.', readOnly: true },
  {
    name: 'create_coshop_room',
    description: 'Create live API-backed co-shop room with share URL.',
  },
  {
    name: 'export_shopify_catalog',
    description: 'Export Shopify Catalog JSON for agent feeds.',
    readOnly: true,
  },
  {
    name: 'validate_catalog_feed',
    description: 'Validate Shopify-shaped feed (GTIN, variants, prices).',
    readOnly: true,
  },
  {
    name: 'apply_readiness_fix',
    description:
      'Autopilot: disable CAPTCHA, remove account wall, or sync stale feed prices.',
  },
  {
    name: 'simulate_agent_journey',
    description:
      'Run search → add → order → checkout and return pass/fail per step.',
    readOnly: true,
  },
  {
    name: 'import_shopify_catalog',
    description: 'Import Shopify JSON as a new browsable store (client persist).',
  },
  {
    name: 'get_field_companion',
    description:
      'Agent commerce handbook: pressing issues, checklist, research briefs, protocols. topic=issues|checklist|research|protocols|gtin-gap|…',
    readOnly: true,
  },
  {
    name: 'review_against_field',
    description:
      'Map a store’s crawl signals (gtinPct, captchaHint, catalogScore, error) to handbook issues + next steps.',
    readOnly: true,
  },
];

/**
 * The manifest every client actually reads, with parameter schemas attached.
 *
 * /api/v1/tools and the agent runner serve THIS, not the bare list — advertising
 * a tool without its parameters makes it uncallable.
 */
export const TOOL_MANIFEST_WITH_SCHEMAS: ToolManifestEntry[] = TOOL_MANIFEST.map((t) => ({
  ...t,
  inputSchema: TOOL_SCHEMAS[t.name],
}));
