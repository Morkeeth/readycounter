/**
 * Probe Shopify Storefront Catalog MCP (UCP) at {origin}/api/ucp/mcp.
 * @see https://shopify.dev/docs/agents/catalog/storefront-catalog
 */

const UCP_AGENT_PROFILE =
  'https://shopify.dev/ucp/agent-profiles/examples/2026-08-25/valid-with-capabilities.json';

const FETCH_MS = 12_000;

export interface UcpProbeSnapshot {
  available: boolean;
  endpoint: string;
  tools: string[];
  productCount: number;
  gtinPct: number;
  error?: string;
  httpStatus?: number;
}

interface JsonRpcResponse {
  result?: {
    tools?: Array<{ name: string }>;
    structuredContent?: {
      products?: UcpProduct[];
      pagination?: { total_count?: number };
    };
  };
  error?: { message?: string };
}

interface UcpProduct {
  variants?: Array<{
    sku?: string;
    id?: string;
    barcode?: string;
    gtin?: string;
  }>;
}

function originFromUrl(input: string): string | null {
  try {
    return new URL(input.trim()).origin;
  } catch {
    return null;
  }
}

async function ucpRpc(
  endpoint: string,
  method: string,
  params: Record<string, unknown>,
): Promise<{ ok: true; data: JsonRpcResponse } | { ok: false; status: number; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, id: 1, params }),
      signal: controller.signal,
    });
    const status = res.status;
    if (!res.ok) {
      return { ok: false, status, error: `HTTP ${status}` };
    }
    const data = (await res.json()) as JsonRpcResponse;
    if (data.error?.message) {
      return { ok: false, status, error: data.error.message };
    }
    return { ok: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'fetch failed';
    return { ok: false, status: 0, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

function gtinFromProducts(products: UcpProduct[]): { count: number; withGtin: number } {
  let count = 0;
  let withGtin = 0;
  for (const p of products) {
    for (const v of p.variants ?? []) {
      count += 1;
      const id = v.barcode ?? v.gtin ?? v.sku;
      if (id && String(id).trim().length >= 8) withGtin += 1;
    }
  }
  return { count, withGtin };
}

/** List tools + sample search_catalog to measure SKU/GTIN exposure via UCP. */
export async function probeUcpCatalog(storeUrl: string): Promise<UcpProbeSnapshot> {
  const origin = originFromUrl(storeUrl);
  if (!origin) {
    return {
      available: false,
      endpoint: '',
      tools: [],
      productCount: 0,
      gtinPct: 0,
      error: 'Invalid URL',
    };
  }

  const endpoint = `${origin}/api/ucp/mcp`;
  const agentMeta = {
    meta: {
      'ucp-agent': { profile: UCP_AGENT_PROFILE },
    },
  };

  const listed = await ucpRpc(endpoint, 'tools/list', { arguments: agentMeta });
  if (!listed.ok) {
    return {
      available: false,
      endpoint,
      tools: [],
      productCount: 0,
      gtinPct: 0,
      error: listed.error,
      httpStatus: listed.status || undefined,
    };
  }

  const tools = (listed.data.result?.tools ?? []).map((t) => t.name);

  const searched = await ucpRpc(endpoint, 'tools/call', {
    name: 'search_catalog',
    arguments: {
      ...agentMeta,
      catalog: {
        query: 'a',
        pagination: { limit: 25 },
        context: { address_country: 'US' },
      },
    },
  });

  if (!searched.ok) {
    return {
      available: tools.length > 0,
      endpoint,
      tools,
      productCount: 0,
      gtinPct: 0,
      error: searched.error,
      httpStatus: searched.status || undefined,
    };
  }

  const products = searched.data.result?.structuredContent?.products ?? [];
  const { count, withGtin } = gtinFromProducts(products);
  const productCount =
    count > 0 ? count : (searched.data.result?.structuredContent?.pagination?.total_count ?? products.length);

  return {
    available: true,
    endpoint,
    tools,
    productCount,
    gtinPct: count > 0 ? Math.round((withGtin / count) * 100) : 0,
  };
}
