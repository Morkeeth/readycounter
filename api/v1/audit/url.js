// src/data/field-companion.ts
var FIELD_RECEIPT = {
  updated: "2026-08-31",
  attempted: 148,
  crawled: 78,
  crawlRatePct: 53,
  gtinPctOnCrawled: 0,
  catalogScoreOnCrawled: "0/24",
  curatedMapped: 148,
  ucpAvailable: 81,
  ucpGtinWhereCrawlZero: 11,
  headline: "78/78 crawled: 0% GTIN in public feeds. 11 stores still show GTIN via UCP MCP \u2014 scrape \u2260 agent protocol."
};
var PRESSING_ISSUES = [
  {
    rank: 1,
    id: "gtin-gap",
    title: "Empty variant barcodes (GTIN / MPN)",
    why: "Instant Checkout and AI matching keys are identifiers. OpenAI: provide valid gtin or mpn when identifier_exists is yes/omitted. Stripe: mpn required if GTIN missing. Shopify stores them on variant barcode.",
    fails: "Agent cannot match your SKU; feed rows reject or rank last; Instant Checkout eligibility stalls.",
    doThisWeek: "Fill Variant Barcode (GTIN) or MPN for every sellable variant. If no GTIN exists, set identifier_exists=false (or omit) and supply mpn. Re-import \u2192 curl /products.json \u2192 check variants[].barcode. Aim \u226590% identifier coverage.",
    evidence: "OpenAI products feed \xB7 Stripe agentic feed \xB7 ReadyCounter R1 (0% public GTIN)"
  },
  {
    rank: 2,
    id: "products-json",
    title: "Headless cutover killed /products.json",
    why: "~40% of headless DTC lost the open feed on Hydrogen/Next cutover (CatalogScan).",
    fails: "Bulk discovery never starts \u2014 PDPs still look fine to humans.",
    doThisWeek: "curl -sI https://YOURSTORE.com/products.json \u2014 must return JSON with a products array. Proxy Storefront API if headless.",
    evidence: "CatalogScan \xB7 ReadyCounter 49% block rate"
  },
  {
    rank: 3,
    id: "captcha",
    title: "CAPTCHA / bot walls at checkout",
    why: "CAPTCHA or a verification wall is the cause of 24% of abandoned agent carts (Presenc AI, read 2026-08-31) \u2014 the same weight the readiness tape charges.",
    fails: "Agent abandons permanently after a hard challenge.",
    doThisWeek: "Allow-list known agent operators; prefer UCP/ACP in-chat checkout; reserve CAPTCHA for fraud.",
    evidence: "Presenc 2026 \xB7 ReadyCounter R3"
  },
  {
    rank: 4,
    id: "schema-offer",
    title: "Product schema without Offer / price",
    why: "73% of ecommerce emit Product JSON-LD; only 19% include Offer (Digital Applied 5k).",
    fails: "Agents cannot quote price/availability from structured data.",
    doThisWeek: "Rich Results Test on 5 PDPs \u2014 require Offer with price, currency, availability URL, plus gtin/sku.",
    evidence: "Digital Applied 2026 \xB7 Google Product structured data"
  },
  {
    rank: 5,
    id: "protocol-fragmentation",
    title: "Protocol fragmentation (UCP \xB7 ACP \xB7 AP2 \xB7 MCP)",
    why: "MCP is transport; UCP/ACP are commerce language; AP2 is payment proof.",
    fails: "Live on one rail, invisible on another; legacy /api/mcp after UCP rename.",
    doThisWeek: "Shopify: Agentic Storefronts + channel toggles. Multi-platform: ACP feed and UCP profile where applicable.",
    evidence: "Shopify/Google UCP \xB7 OpenAI ACP \xB7 AP2"
  },
  {
    rank: 6,
    id: "catalog-quality",
    title: "Syndicated Catalog with incomplete data",
    why: "Agentic Storefronts amplify Admin data \u2014 including empty barcodes \u2014 into ChatGPT, Copilot, Gemini.",
    fails: "Invisible or unmatchable SKUs at AI scale.",
    doThisWeek: "Complete barcode, type, images, variants; add Knowledge Base policies; monitor AI orders.",
    evidence: "Shopify Agentic Storefronts / Catalog"
  },
  {
    rank: 7,
    id: "ucp-mcp",
    title: "Wrong or gated UCP Catalog MCP",
    why: "Storefront Catalog MCP at /api/ucp/mcp expects agent profiles. 81/148 curated stores answer it; 11 show GTIN on UCP while public crawl is 0%.",
    fails: "Silent negotiation failure; or agents scrape HTML and miss identifiers UCP already exposes.",
    doThisWeek: "Confirm /.well-known/ucp and /api/ucp/mcp; keep Hydrogen MCP proxies enabled; prefer compare (crawl+UCP) over scrape-only.",
    evidence: "ReadyCounter E3/E3b \xB7 Shopify Storefront Catalog MCP"
  },
  {
    rank: 8,
    id: "acp-eligibility",
    title: "Instant Checkout policy / eligibility gaps",
    why: "ACP requires search eligibility before checkout, plus privacy/ToS URLs when checkout-eligible. OpenAI: is_eligible_checkout requires is_eligible_search=true.",
    fails: "Discoverable products that never become buyable in-chat.",
    doThisWeek: "Publish live privacy + ToS URLs; set is_eligible_search then is_eligible_checkout; ensure gtin or mpn when identifier_exists is yes/omitted; align feed links with live PDPs.",
    evidence: "OpenAI products upload spec \xB7 Stripe feed"
  },
  {
    rank: 9,
    id: "account-wall",
    title: "Forced account walls",
    why: "A forced account wall is the cause of 15% of abandoned agent carts (Presenc AI, read 2026-08-31) \u2014 the same weight the readiness tape charges.",
    fails: "Agent cannot create accounts mid-funnel.",
    doThisWeek: "Keep guest checkout; prefer protocol checkout.",
    evidence: "Presenc checkout benchmarks"
  },
  {
    rank: 10,
    id: "price-drift",
    title: "Price / availability drift",
    why: "17% of agent checkout failures \u2014 quoted feed \u2260 checkout.",
    fails: "Trust break; agent abandons.",
    doThisWeek: "One inventory source of truth; refresh volatile feeds \u226415\u201360 min.",
    evidence: "Presenc \xB7 Stripe availability rules"
  }
];
function reviewAgainstField(input) {
  const feedBlocked = Boolean(input.error) || input.productsJsonOk === false;
  const flags = [];
  if (feedBlocked) {
    flags.push({
      issueId: "products-json",
      severity: "high",
      note: input.error ?? "Public products feed unavailable \u2014 agents cannot bulk-ingest."
    });
  } else {
    const gtinNotes = [];
    if ((input.gtinPct ?? 0) < 50) {
      gtinNotes.push(
        `GTIN coverage ${input.gtinPct ?? 0}% \u2014 fill barcode or MPN (Stripe requires mpn if GTIN missing; OpenAI uses identifier_exists).`
      );
    }
    if ((input.catalogScore ?? 0) === 0) {
      gtinNotes.push("Catalog legibility 0 \u2014 matches the field default (0/24 on crawled DTC).");
    }
    if (gtinNotes.length) {
      flags.push({
        issueId: "gtin-gap",
        severity: "high",
        note: gtinNotes.join(" ")
      });
    }
  }
  if (input.captchaHint) {
    flags.push({
      issueId: "captcha",
      severity: "medium",
      note: "CAPTCHA hint on storefront HTML \u2014 verify checkout path, not homepage strings alone (R3)."
    });
  }
  if (input.accountWall) {
    flags.push({
      issueId: "account-wall",
      severity: "high",
      note: "Account wall set \u2014 agents fail guest checkout (15% of abandoned agent carts, Presenc AI)."
    });
  }
  if (input.offerPct != null && input.offerPct < 20) {
    flags.push({
      issueId: "schema-offer",
      severity: "medium",
      note: `Offer JSON-LD on ${input.offerPct}% of Product nodes \u2014 field benchmark ~19% (Digital Applied). Add Offer with price + availability on PDPs.`
    });
  }
  const ps = input.policySmoke;
  if (ps && (ps.privacyOk === false || ps.termsOk === false || !ps.privacyUrl && !ps.termsUrl)) {
    const parts = [];
    if (!ps.privacyUrl) parts.push("privacy URL not found");
    else if (ps.privacyOk === false) parts.push("privacy URL not reachable");
    if (!ps.termsUrl) parts.push("terms URL not found");
    else if (ps.termsOk === false) parts.push("terms URL not reachable");
    flags.push({
      issueId: "acp-eligibility",
      severity: "medium",
      note: `ACP policy smoke: ${parts.join("; ")} \u2014 Instant Checkout needs live privacy + ToS.`
    });
  }
  const capped = flags.slice(0, 3);
  const issues = capped.map((f) => ({
    ...f,
    issue: PRESSING_ISSUES.find((i) => i.id === f.issueId)
  }));
  return {
    ok: true,
    comparedToField: FIELD_RECEIPT.headline,
    flagCount: capped.length,
    flags: issues,
    nextSteps: issues.map((f) => f.issue.doThisWeek),
    companionTool: "get_field_companion"
  };
}

// src/data/sources.ts
var SOURCES = {
  presenc_captcha: {
    id: "presenc_captcha",
    claim: "A CAPTCHA or verification wall is the cause of 24% of abandoned agent carts.",
    figure: "24%",
    publisher: "Presenc AI",
    url: "https://presenc.ai/research/agent-cart-abandonment-statistics-2026",
    published: "2026-06",
    accessed: "2026-08-31",
    caveat: 'Vendor research page, not peer reviewed. Presenc states the metrics are "modeled from observed agent sessions and vendor-reported benchmarks."'
  },
  presenc_account_wall: {
    id: "presenc_account_wall",
    claim: "A required account or login is the cause of 15% of abandoned agent carts \u2014 its own row in the same table, separate from the CAPTCHA.",
    figure: "15%",
    publisher: "Presenc AI",
    url: "https://presenc.ai/research/agent-cart-abandonment-statistics-2026",
    published: "2026-06",
    accessed: "2026-08-31",
    caveat: "Same modeled panel as the 24% CAPTCHA figure. ReadyCounter charged this wall 24 points until 2026-08-31, when a re-read of the cited table found the row."
  },
  presenc_price_mismatch: {
    id: "presenc_price_mismatch",
    claim: "A price that does not match the listed feed causes 18% of abandoned agent carts \u2014 its own row, separate from the 26% stale-data row.",
    figure: "18%",
    publisher: "Presenc AI",
    url: "https://presenc.ai/research/agent-cart-abandonment-statistics-2026",
    published: "2026-06",
    accessed: "2026-08-31",
    caveat: "Same modeled panel as the other rows. The page gives no definition beyond the row label; reading it as feed-price vs shelf-price is ReadyCounter\u2019s reading, stated on the line."
  },
  presenc_payment_method: {
    id: "presenc_payment_method",
    claim: "An unsupported payment method causes 11% of abandoned agent carts.",
    figure: "11%",
    publisher: "Presenc AI",
    url: "https://presenc.ai/research/agent-cart-abandonment-statistics-2026",
    published: "2026-06",
    accessed: "2026-08-31",
    caveat: "Same modeled panel. The page does not say which methods an agent can complete; the test for that is ReadyCounter\u2019s and is printed on the line."
  },
  presenc_page_structure: {
    id: "presenc_page_structure",
    claim: "Ambiguous page structure causes 6% of abandoned agent carts.",
    figure: "6%",
    publisher: "Presenc AI",
    url: "https://presenc.ai/research/agent-cart-abandonment-statistics-2026",
    published: "2026-06",
    accessed: "2026-08-31",
    caveat: "The weakest-defined row on the table: a bare label with no prose anywhere on the page. ReadyCounter defines the test (schema.org Product + Offer with a resolvable identifier) and says so on the line."
  },
  presenc_stale_feed: {
    id: "presenc_stale_feed",
    claim: "Stale price or stock data at checkout causes 26% of abandoned agent carts.",
    figure: "26%",
    publisher: "Presenc AI",
    url: "https://presenc.ai/research/agent-cart-abandonment-statistics-2026",
    published: "2026-06",
    accessed: "2026-08-31",
    caveat: "Same modeled panel as the CAPTCHA figure; treat as an industry benchmark, not a census."
  },
  presenc_abandon: {
    id: "presenc_abandon",
    claim: "Agent carts abandon at 78.6%, against a human benchmark near 70%.",
    figure: "78.6%",
    publisher: "Presenc AI",
    url: "https://presenc.ai/research/agent-cart-abandonment-statistics-2026",
    published: "2026-06",
    accessed: "2026-08-31"
  },
  schema_offer_gap: {
    id: "schema_offer_gap",
    claim: "Of ecommerce sites that emit Product schema, only 19% include the Offer object agents read for price and availability.",
    figure: "19% carry Offer",
    publisher: "Digital Applied \u2014 5,000-site audit",
    url: "https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026",
    published: "2026-04-26",
    accessed: "2026-08-30",
    caveat: "The 81% figure quoted in the pitch is our subtraction (100 \u2212 19), not a headline in the audit."
  },
  shopify_catalog_2x: {
    id: "shopify_catalog_2x",
    claim: "Traffic from catalog-powered AI search converts 2\xD7 better than AI search working from scraped data.",
    figure: "2\xD7",
    publisher: "Shopify \u2014 Q1 2026 earnings call (Harley Finkelstein)",
    url: "https://stockanalysis.com/stocks/shop/transcripts/555081-q1-2026/",
    published: "2026-Q1",
    accessed: "2026-08-30"
  },
  shopify_ai_traffic: {
    id: "shopify_ai_traffic",
    claim: "AI-referred sessions to Shopify storefronts grew more than 8\xD7 year over year; AI-referred orders nearly 13\xD7.",
    figure: "8\xD7 / 13\xD7",
    publisher: "Shopify Enterprise",
    url: "https://www.shopify.com/enterprise/blog/ai-search-insights",
    published: "2026-05-11",
    accessed: "2026-08-30"
  },
  adobe_conversion_flip: {
    id: "adobe_conversion_flip",
    claim: "AI-referred traffic converted 38% worse than other traffic in March 2025 and 42% better in March 2026.",
    figure: "\u221238% \u2192 +42%",
    publisher: "Adobe Digital Insights",
    url: "https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable",
    published: "2026-04-16",
    accessed: "2026-08-30",
    caveat: "Adobe compares AI-referred traffic to all non-AI traffic combined, not to organic search alone."
  },
  yougov_trust_gap: {
    id: "yougov_trust_gap",
    claim: "65% of US adults are comfortable letting AI compare prices; 14% are comfortable letting it place the order.",
    figure: "65% vs 14%",
    publisher: "YouGov (US), fieldwork for Checkout.com",
    url: "https://yougov.com/en-us/articles/53808-american-trust-in-ai-for-retail-consumer-sentiment-in-2025",
    published: "2025-12-04",
    accessed: "2026-08-30",
    caveat: "1,287 US adults online, weighted, \xB13pp. UK fieldwork gives 66% / 11%."
  }
};
var SOURCE_IDS = Object.keys(SOURCES);

// src/lib/catalogSchema.ts
function catalogJsonLd(storeName, products) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${storeName} Catalog`,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        sku: product.id,
        ...product.gtin ? { gtin13: product.gtin } : {},
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency,
          availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }
    }))
  };
}
var REQUIRED_JSONLD_FIELDS = [
  "name",
  "sku",
  "gtin13",
  "offers.price",
  "offers.priceCurrency",
  "offers.availability"
];
function pathValue(record, path) {
  return path.split(".").reduce((node, key) => {
    if (node === null || typeof node !== "object") return void 0;
    return node[key];
  }, record);
}
function emittedProductRecords(storeName, products) {
  const doc = catalogJsonLd(storeName, products);
  const list = doc.itemListElement ?? [];
  return list.map((entry) => entry.item).filter((item) => !!item && typeof item === "object");
}
function missingJsonLdFields(record) {
  return REQUIRED_JSONLD_FIELDS.filter((path) => {
    const value = pathValue(record, path);
    return value === void 0 || value === null || value === "";
  });
}
function catalogLegibility(storeName, products) {
  const records = emittedProductRecords(storeName, products);
  const gapCount = /* @__PURE__ */ new Map();
  let legible = 0;
  for (const record of records) {
    const missing = missingJsonLdFields(record);
    if (missing.length === 0) legible += 1;
    for (const field of missing) gapCount.set(field, (gapCount.get(field) ?? 0) + 1);
  }
  return {
    total: records.length,
    legible,
    gaps: [...gapCount.entries()].map(([field, missing]) => ({ field, missing })).sort((a, b) => b.missing - a.missing)
  };
}

// src/lib/orderMath.ts
function chargeForLine(line2, products) {
  const product = products.find((p) => p.id === line2.productId);
  return (product?.price ?? 0) * line2.quantity;
}
function addRefusal(product, quantity, productId) {
  if (!product)
    return productId ? `Product not found: ${productId}` : "Missing product id \u2014 pass product_id (or id / sku) from search_catalog.";
  if (!product.inStock) return `Out of stock: ${productId}`;
  if (quantity < 1 || quantity > 99) return "Quantity must be 1\u201399";
  return null;
}
function probeCheckoutSurvival(products) {
  return products.map((product) => {
    const shown = product.price;
    const charged = chargeForLine({ productId: product.id, quantity: 1 }, products);
    const refusal = addRefusal(product, 1, product.id);
    return {
      productId: product.id,
      shown,
      charged,
      refusal,
      survives: refusal === null && charged === shown
    };
  });
}

// src/lib/readiness.ts
var POINT_BUDGET = 100;
var WEIGHTS = [
  {
    id: "checkout_freshness",
    max: 26,
    basis: "measured",
    sourceIds: ["presenc_stale_feed"],
    rationale: 'Published weight: Presenc AI attributes 26% of abandoned agent carts to stale price or stock data at checkout \u2014 the largest row on the table. Our test: every SKU the catalog surfaces is run through the real order path, and it survives only if the store still accepts it and bills exactly the price the catalog handed the agent. The source\u2019s one sentence about this row is "when the price or availability the agent saw differs from checkout, the agent halts rather than guessing", so both halves are asserted. Honest limit: in these two demo stores the price half cannot fail, because the catalog record and the order path read the same field \u2014 the half that discriminates here is availability. The price assertion still goes red the moment checkout bills anything else, and an imported real catalog is where it earns its keep.'
  },
  {
    id: "agent_checkout_path",
    max: 24,
    basis: "measured",
    sourceIds: ["presenc_captcha"],
    rationale: "Published weight: Presenc AI attributes 24% of abandoned agent carts to a CAPTCHA or verification wall. Our test: the merchant config declares whether a CAPTCHA stands on the checkout path. All of it, or none of it."
  },
  {
    id: "feed_price_match",
    max: 18,
    basis: "measured",
    sourceIds: ["presenc_price_mismatch"],
    rationale: 'Published weight: "Price mismatch vs listed feed \u2014 18%" is its own row, three lines below the 26% stale-data row. Our test: for every SKU, the price in the catalog feed equals the price on the shelf. This line used to carry the 26 instead, which billed one defect at another row\u2019s price; it now takes the row that names the defect it detects, and never adds the 26 on top.'
  },
  {
    id: "account_wall",
    max: 15,
    basis: "measured",
    sourceIds: ["presenc_account_wall"],
    rationale: "Published weight: Presenc AI gives a required account or login its own row \u2014 15% of abandoned agent carts, not the CAPTCHA\u2019s 24%. Our test: the merchant config declares whether an account is forced before payment."
  },
  {
    id: "payment_method",
    max: 11,
    basis: "measured",
    sourceIds: ["presenc_payment_method"],
    rationale: "Published weight: an unsupported payment method causes 11% of abandoned agent carts. Our test, and this one is a classification we own: a prepared agent order must be completable on at least one method the store accepts, with no step only a human at the device can take. A stored credential passes. A per-transaction 3-D Secure step-up, a device biometric, a redirect to another site\u2019s login, and a manual invoice approval do not. The source prices the cause and never says which methods qualify, so the line is scored all-or-nothing on our definition and prints it."
  },
  {
    id: "page_structure",
    max: 6,
    basis: "measured",
    sourceIds: ["presenc_page_structure", "schema_offer_gap"],
    rationale: 'Published weight: "Ambiguous page structure \u2014 6%", the smallest row and the only one with no prose anywhere on the source page. Our test, stated because the source states nothing: we read back the JSON-LD this page actually emits and require each product record to carry name, sku, a resolvable gtin13, and an Offer with price, priceCurrency and availability. A store-local SKU identifies a product inside this store and resolves to nothing outside it, which is why the GTIN is on the list. Digital Applied\u2019s 5,000-site audit found only 19% of Product schemas carry an Offer object at all.'
  }
];
var WEIGHT_BY_ID = new Map(WEIGHTS.map((w) => [w.id, w]));
function weightFor(id) {
  const w = WEIGHT_BY_ID.get(id);
  if (!w) throw new Error(`no weight row for ${id}`);
  return w.max;
}
var MEASURED_POINTS = WEIGHTS.filter((w) => w.basis === "measured").reduce(
  (n, w) => n + w.max,
  0
);
var ALLOCATED_POINTS = POINT_BUDGET - MEASURED_POINTS;
var TOOL_FLOOR = 6;
function statusFor(earned, max) {
  if (earned >= max) return "pass";
  if (earned >= max * 0.6) return "warn";
  return "fail";
}
function line(id, label, earnedShare, detail, stat, fix) {
  const w = WEIGHT_BY_ID.get(id);
  const clamped = Math.max(0, Math.min(1, earnedShare));
  const points = Math.round(w.max * clamped);
  return {
    id,
    label,
    status: statusFor(points, w.max),
    detail,
    stat,
    points,
    maxPoints: w.max,
    basis: w.basis,
    sourceIds: w.sourceIds,
    rationale: w.rationale,
    fix
  };
}
function paymentMethodsOf(config) {
  return config.paymentMethods ?? [];
}
function agentPayableMethods(config) {
  return paymentMethodsOf(config).filter((m) => m.agentCompletable);
}
function computeReadinessChecks(config, registeredToolCount, products) {
  void registeredToolCount;
  const total = Math.max(1, products.length);
  const mismatched = products.filter(
    (p) => p.feedPrice !== void 0 && p.feedPrice !== p.price
  );
  const cleanFeed = total - mismatched.length;
  const probes = probeCheckoutSurvival(products);
  const survived = probes.filter((p) => p.survives);
  const refused = probes.filter((p) => p.refusal !== null);
  const repriced = probes.filter((p) => p.refusal === null && p.charged !== p.shown);
  const legibility = catalogLegibility(config.storeName, products);
  const methods = paymentMethodsOf(config);
  const payable = agentPayableMethods(config);
  const captchaOn = config.checkoutRequiresCaptcha;
  const accountOn = config.checkoutRequiresAccount;
  return [
    line(
      "checkout_freshness",
      "What the agent was shown survives to checkout",
      survived.length / total,
      survived.length === total ? `All ${total} SKUs run the order path unchanged: the store accepts every one, and bills the price its catalog record quoted.` : `${total - survived.length} of ${total} SKUs do not survive the order path. ` + (refused.length > 0 ? `${refused.length} the store refuses outright (${refused.map((p) => p.refusal).join("; ")}) \u2014 an agent that searched the catalog builds a cart it cannot fill. ` : "") + (repriced.length > 0 ? `${repriced.length} are billed at a price the catalog did not quote. ` : "") + "Presenc AI: when the price or availability the agent saw differs at checkout, the agent halts rather than guessing.",
      `${survived.length}/${total} survive`,
      survived.length === total ? "Nothing to fix \u2014 keep the feed job running." : "Delist or restock what the order path refuses, so the searchable catalog is the fillable catalog."
    ),
    line(
      "agent_checkout_path",
      "No CAPTCHA on the checkout path",
      captchaOn ? 0 : 1,
      captchaOn ? `A CAPTCHA stands between a prepared order and payment. Presenc AI attributes ${weightFor("agent_checkout_path")}% of abandoned agent carts to a CAPTCHA or verification wall, so this line costs ${weightFor("agent_checkout_path")}.` : "No CAPTCHA. An agent can carry a prepared order to the point a human pays.",
      captchaOn ? "CAPTCHA ON" : "CLEAR",
      captchaOn ? "Turn the CAPTCHA off for prepared-order traffic, or move it after payment intent." : "Nothing to fix."
    ),
    line(
      "feed_price_match",
      "Price feed agrees with the shelf",
      cleanFeed / total,
      mismatched.length === 0 ? `All ${total} SKUs quote the same price in the feed and on the page.` : `${mismatched.length} of ${total} SKUs quote a feed price that is not the shelf price: ${mismatched.map((p) => p.name).join(", ")}. An agent that quotes the feed and pays the shelf gets a mismatch at checkout \u2014 Presenc AI's own row, ${weightFor("feed_price_match")}%.`,
      `${cleanFeed}/${total} SKUs agree`,
      mismatched.length === 0 ? "Nothing to fix \u2014 keep the feed job running." : "Re-sync the product feed so feedPrice equals the live price."
    ),
    line(
      "account_wall",
      "No forced account on the checkout path",
      accountOn ? 0 : 1,
      accountOn ? `A forced account or login stands between a prepared order and payment. Presenc AI gives that its own row \u2014 ${weightFor("account_wall")}% of abandoned agent carts \u2014 so this line costs ${weightFor("account_wall")}, not the CAPTCHA's ${weightFor("agent_checkout_path")}. Both walls are priced by the same published table; neither price is ours.` : "No forced account. An agent can reach checkout without creating a login first.",
      accountOn ? "ACCOUNT WALL ON" : "CLEAR",
      accountOn ? "Allow guest checkout, or defer account creation until after the order is placed." : "Nothing to fix."
    ),
    line(
      "payment_method",
      "A payment method an agent can complete",
      payable.length > 0 ? 1 : 0,
      methods.length === 0 ? `This store declares no payment methods, so nothing here can complete a prepared order. Presenc AI prices an unsupported payment method at ${weightFor("payment_method")}% of abandoned agent carts.` : payable.length > 0 ? `${payable.length} of ${methods.length} accepted methods complete without a human-only step: ${payable.map((m) => m.label).join(", ")}. The agent can hand the order over and it goes through.` : `${methods.length} methods accepted, none of which a prepared agent order can complete: ${methods.map((m) => `${m.label} (${m.humanStep ?? "human-only step"})`).join("; ")}. Presenc AI prices this at ${weightFor("payment_method")}% of abandoned agent carts, and this line is all-or-nothing because the agent only needs one route that works.`,
      payable.length > 0 ? `${payable.length}/${methods.length} agent-payable` : "NO AGENT ROUTE",
      payable.length > 0 ? "Nothing to fix." : "Accept one method that completes on a stored credential, so a prepared order does not need a human at the device."
    ),
    line(
      "page_structure",
      "Product records an agent can read",
      legibility.legible / Math.max(1, legibility.total),
      legibility.legible === legibility.total ? `All ${legibility.total} emitted product records carry every field an agent needs to price, check and match the item.` : `${legibility.total - legibility.legible} of ${legibility.total} emitted product records are missing a required field (${legibility.gaps.map((g) => `${g.field} \xD7 ${g.missing}`).join(", ")}). Read back out of the JSON-LD this page publishes, not out of the fixture.`,
      `${legibility.legible}/${legibility.total} complete records`,
      legibility.legible === legibility.total ? "Nothing to fix." : `Emit the missing fields: ${legibility.gaps.map((g) => g.field).join(", ")}.`
    )
  ];
}
function reportedLines(registeredToolCount) {
  const met = registeredToolCount >= TOOL_FLOOR;
  return [
    {
      id: "webmcp_tools",
      label: "Tools the score is measured through",
      status: met ? "pass" : "fail",
      detail: met ? `${registeredToolCount} typed tools registered, against a floor of ${TOOL_FLOOR}. Every charged line above is read through this surface \u2014 the order path the freshness probe runs, the catalog the feed and record checks read. No published row prices a tool surface, so ReadyCounter charges nothing for it and says so here instead of inventing a weight.` : `${registeredToolCount} typed tools registered, below the floor of ${TOOL_FLOOR}. Under the floor the six charged lines are being read through a surface too thin to trust, so treat the total as unmeasured rather than earned.`,
      stat: `${registeredToolCount} tools \xB7 floor ${TOOL_FLOOR}`,
      points: 0,
      maxPoints: 0,
      basis: "reported",
      sourceIds: ["shopify_catalog_2x"],
      rationale: "Shopify reports catalog-powered AI search converts 2\xD7 scraped search, which is the case for a typed tool surface \u2014 but it is not a row on any abandonment table, so it earns no points here. Reported, not charged.",
      fix: met ? "Nothing to fix." : `Register ${TOOL_FLOOR - registeredToolCount} more tool(s) in src/webmcp/registerTools.ts.`
    }
  ];
}
function readinessScore(checks) {
  const itemised = checks.filter((c) => typeof c.points === "number" && typeof c.maxPoints === "number");
  if (itemised.length === checks.length && checks.length > 0) {
    const earned = itemised.reduce((n, c) => n + (c.points ?? 0), 0);
    const possible = itemised.reduce((n, c) => n + (c.maxPoints ?? 0), 0);
    return possible === 0 ? 0 : Math.round(earned / possible * 100);
  }
  const weights = { pass: 1, warn: 0.5, fail: 0 };
  const total = checks.reduce((sum, c) => sum + weights[c.status], 0);
  return checks.length === 0 ? 0 : Math.round(total / checks.length * 100);
}

// src/webmcp/toolSchemas.ts
var TOOL_SCHEMAS = {
  search_catalog: {
    type: "object",
    properties: {
      query: { type: "string", description: "Free-text search." },
      category: {
        type: "string",
        enum: [
          "beans",
          "kits",
          "equipment",
          "beverages",
          "merch",
          "subscription",
          "powder"
        ]
      },
      max_price: { type: "number", minimum: 0 },
      in_stock_only: { type: "boolean" }
    },
    additionalProperties: false
  },
  get_product: {
    type: "object",
    properties: {
      id: { type: "string", description: "Product SKU id. `product_id` and `sku` are accepted too." }
    },
    required: ["id"],
    additionalProperties: false
  },
  add_to_order: {
    type: "object",
    properties: {
      product_id: {
        type: "string",
        description: "Product SKU id, as returned by search_catalog. `id` and `sku` are accepted too."
      },
      quantity: { type: "integer", minimum: 1, maximum: 99, default: 1 }
    },
    required: ["product_id"],
    additionalProperties: false
  },
  update_line_quantity: {
    type: "object",
    properties: {
      line_id: { type: "string" },
      quantity: { type: "integer", minimum: 0, maximum: 99 }
    },
    required: ["line_id", "quantity"],
    additionalProperties: false
  },
  remove_line: {
    type: "object",
    properties: { line_id: { type: "string" } },
    required: ["line_id"],
    additionalProperties: false
  },
  get_order: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  get_delivery_quote: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  prepare_checkout: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  get_readiness_score: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  get_merchant_config: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  create_coshop_room: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  export_shopify_catalog: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  validate_catalog_feed: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  apply_readiness_fix: {
    type: "object",
    properties: {
      fix: {
        type: "string",
        enum: ["disable_captcha", "disable_account_wall", "sync_feed_prices"]
      }
    },
    required: ["fix"],
    additionalProperties: false
  },
  simulate_agent_journey: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  import_shopify_catalog: {
    type: "object",
    properties: {
      feed: { type: "object", description: "Shopify Catalog export JSON" },
      store_id: { type: "string" },
      store_name: { type: "string" }
    },
    required: ["feed"],
    additionalProperties: false
  },
  get_field_companion: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "all | issues | checklist | research | protocols | issue id (e.g. gtin-gap) | rank number"
      }
    },
    additionalProperties: false
  },
  review_against_field: {
    type: "object",
    properties: {
      gtinPct: { type: "number" },
      catalogScore: { type: "number" },
      captchaHint: { type: "boolean" },
      productsJsonOk: { type: "boolean" },
      accountWall: { type: "boolean" },
      error: { type: "string" }
    },
    additionalProperties: false
  }
};

// src/webmcp/toolManifest.ts
var WEBMCP_TOOL_COUNT = 18;
var TOOL_MANIFEST = [
  {
    name: "search_catalog",
    description: "Search catalog by query, category, max_price, in_stock_only.",
    readOnly: true
  },
  { name: "get_product", description: "Full product record by SKU id.", readOnly: true },
  { name: "add_to_order", description: "Add to shared co-shop order (no payment)." },
  { name: "update_line_quantity", description: "Update line quantity in shared order." },
  { name: "remove_line", description: "Remove a line from shared order." },
  { name: "get_order", description: "Current shared order + subtotal.", readOnly: true },
  { name: "get_delivery_quote", description: "Shipping quote for current order.", readOnly: true },
  {
    name: "prepare_checkout",
    description: "Validate checkout; blocked if CAPTCHA/account wall.",
    readOnly: true
  },
  {
    name: "get_readiness_score",
    description: "Merchant readiness /100 + per-check breakdown.",
    readOnly: true
  },
  { name: "get_merchant_config", description: "Checkout flags + store metadata.", readOnly: true },
  {
    name: "create_coshop_room",
    description: "Create live API-backed co-shop room with share URL."
  },
  {
    name: "export_shopify_catalog",
    description: "Export Shopify Catalog JSON for agent feeds.",
    readOnly: true
  },
  {
    name: "validate_catalog_feed",
    description: "Validate Shopify-shaped feed (GTIN, variants, prices).",
    readOnly: true
  },
  {
    name: "apply_readiness_fix",
    description: "Autopilot: disable CAPTCHA, remove account wall, or sync stale feed prices."
  },
  {
    name: "simulate_agent_journey",
    description: "Run search \u2192 add \u2192 order \u2192 checkout and return pass/fail per step.",
    readOnly: true
  },
  {
    name: "import_shopify_catalog",
    description: "Import Shopify JSON as a new browsable store (client persist)."
  },
  {
    name: "get_field_companion",
    description: "Agent commerce handbook: pressing issues, checklist, research briefs, protocols. topic=issues|checklist|research|protocols|gtin-gap|\u2026",
    readOnly: true
  },
  {
    name: "review_against_field",
    description: "Map a store\u2019s crawl signals (gtinPct, captchaHint, catalogScore, error) to handbook issues + next steps.",
    readOnly: true
  }
];
var TOOL_MANIFEST_WITH_SCHEMAS = TOOL_MANIFEST.map((t) => ({
  ...t,
  inputSchema: TOOL_SCHEMAS[t.name]
}));

// src/lib/audit-findings.ts
function unknownLine(id, label, detail, fix, evidence) {
  return {
    id,
    label,
    status: "warn",
    detail,
    stat: "NOT MEASURED",
    points: 0,
    maxPoints: 0,
    basis: "reported",
    sourceIds: [],
    rationale: "This line prices a checkout behaviour Presenc AI names, but a URL crawl cannot see the checkout path. ReadyCounter does not invent a pass.",
    fix,
    confidence: "unknown",
    evidence
  };
}
function scrapedCatalogLegibility(products) {
  const gapCount = /* @__PURE__ */ new Map();
  let legible = 0;
  for (const p of products) {
    const record = {
      name: p.name,
      sku: p.id,
      ...p.gtin ? { gtin13: p.gtin } : {},
      offers: {
        price: p.price,
        priceCurrency: p.currency,
        availability: p.inStock ? "InStock" : "OutOfStock"
      }
    };
    const missing = missingJsonLdFields(record);
    if (missing.length === 0) legible += 1;
    for (const field of missing) gapCount.set(field, (gapCount.get(field) ?? 0) + 1);
  }
  return {
    total: products.length,
    legible,
    gaps: [...gapCount.entries()].map(([field, missing]) => ({ field, missing })).sort((a, b) => b.missing - a.missing)
  };
}
function lineFromCheck(check, confidence, evidence) {
  return { ...check, confidence, evidence };
}
function computeAuditFindings(config, products, audit, toolCount = WEBMCP_TOOL_COUNT) {
  const source = audit?.source ?? "builtin";
  const sandboxChecks = computeReadinessChecks(config, toolCount, products);
  const reported = reportedLines(toolCount);
  if (source === "builtin" || source === "import") {
    const findings = sandboxChecks.map(
      (c) => lineFromCheck(c, source === "builtin" ? "inferred" : "observed", ["sandbox fixture or import"])
    );
    return {
      findings: [...findings, ...reported.map((c) => lineFromCheck(c, "observed", ["tool manifest"]))],
      summary: {
        catalogScore: readinessScore(sandboxChecks),
        catalogBudget: POINT_BUDGET,
        fullScore: readinessScore(sandboxChecks),
        fullBudget: POINT_BUDGET,
        unmeasuredLineIds: []
      }
    };
  }
  const total = Math.max(1, products.length);
  const scraped = scrapedCatalogLegibility(products);
  const mismatched = products.filter((p) => p.feedPrice !== void 0 && p.feedPrice !== p.price);
  const singlePriceSource = audit?.method === "shopify-products-json" || source === "shopify-admin";
  const catalogLines = [];
  if (singlePriceSource) {
    catalogLines.push({
      id: "feed_price_match",
      label: "Price feed agrees with the shelf",
      status: "warn",
      detail: `Only one public price source (${audit?.method}). Mismatch between feed and shelf cannot be detected from a crawl \u2014 connect Shopify Admin or run an agent journey.`,
      stat: `${total}/${total} single source`,
      points: 0,
      maxPoints: weightFor("feed_price_match"),
      basis: "measured",
      sourceIds: ["presenc_price_mismatch"],
      rationale: sandboxChecks.find((c) => c.id === "feed_price_match")?.rationale ?? "",
      fix: "OAuth sync or export a separate agent feed and re-import.",
      confidence: "unknown",
      evidence: ["products.json only \u2014 no independent feed"]
    });
  } else {
    const check = sandboxChecks.find((c) => c.id === "feed_price_match");
    catalogLines.push(
      lineFromCheck(check, mismatched.length === 0 ? "observed" : "observed", [
        `${total - mismatched.length}/${total} SKUs agree`
      ])
    );
  }
  const pageEarned = scraped.legible / Math.max(1, scraped.total);
  const pageMax = weightFor("page_structure");
  const pagePoints = Math.round(pageMax * Math.max(0, Math.min(1, pageEarned)));
  catalogLines.push({
    id: "page_structure",
    label: "Product records an agent can read",
    status: pagePoints >= pageMax ? "pass" : pagePoints >= pageMax * 0.6 ? "warn" : "fail",
    detail: scraped.legible === scraped.total ? `All ${scraped.total} scraped SKUs carry name, sku, gtin, and Offer fields.` : `${scraped.total - scraped.legible} of ${scraped.total} scraped SKUs miss required fields (${scraped.gaps.map((g) => `${g.field} \xD7 ${g.missing}`).join(", ")}). Graded from crawl data, not ReadyCounter's emitted JSON-LD.`,
    stat: `${scraped.legible}/${scraped.total} complete`,
    points: pagePoints,
    maxPoints: pageMax,
    basis: "measured",
    sourceIds: ["presenc_page_structure", "schema_offer_gap"],
    rationale: sandboxChecks.find((c) => c.id === "page_structure")?.rationale ?? "",
    fix: "Add barcodes/GTINs and complete Offer objects in Shopify or theme JSON-LD.",
    confidence: "observed",
    evidence: [`method: ${audit?.method}`, `gtin coverage ${audit?.signals.gtinCoverage ?? 0}%`]
  });
  const unmeasured = [
    unknownLine(
      "checkout_freshness",
      "What the agent was shown survives to checkout",
      "A URL crawl does not run the checkout path. The 26% stale-data row needs a live order probe or Shopify OAuth sync plus agent journey.",
      "Run agent journey after OAuth, or use sandbox autopilot on a connected store.",
      ["checkout not probed"]
    ),
    unknownLine(
      "agent_checkout_path",
      "No CAPTCHA on the checkout path",
      audit?.signals.captchaHints ? "HTML hints suggest bot protection (reCAPTCHA/hCaptcha). Not confirmed at checkout \u2014 treat as high risk." : "No CAPTCHA detected in crawled HTML. Checkout may still gate agents \u2014 not observable from catalog crawl alone.",
      audit?.signals.captchaHints ? "Remove or bypass CAPTCHA for agent checkout traffic." : "Connect Shopify and run prepare_checkout in agent journey to confirm.",
      audit?.signals.captchaHints ? ["captcha keyword in HTML"] : ["no captcha keywords in HTML"]
    ),
    unknownLine(
      "account_wall",
      "No forced account on the checkout path",
      audit?.signals.accountWallHints ? "HTML hints suggest login/account wall language. Not confirmed at checkout." : "Account wall not detectable from catalog crawl.",
      "Allow guest checkout; confirm with agent journey.",
      audit?.signals.accountWallHints ? ["login/account keywords in HTML"] : ["catalog only"]
    ),
    unknownLine(
      "payment_method",
      "A payment method an agent can complete",
      "Payment methods are declared at checkout, not in products.json. Requires merchant config or agent journey.",
      "Declare agent-completable payment methods after OAuth connect.",
      ["checkout not probed"]
    )
  ];
  const measurable = catalogLines.filter((c) => (c.maxPoints ?? 0) > 0);
  const catalogBudget = measurable.reduce((n, c) => n + (c.maxPoints ?? 0), 0);
  const catalogEarned = measurable.reduce((n, c) => n + (c.points ?? 0), 0);
  const catalogScore = catalogBudget === 0 ? 0 : Math.round(catalogEarned / catalogBudget * 100);
  const unmeasuredIds = unmeasured.map((u) => u.id);
  const fullScore = unmeasuredIds.length > 0 ? null : readinessScore(sandboxChecks);
  return {
    findings: [...catalogLines, ...unmeasured, ...reported.map((c) => lineFromCheck(c, "observed", ["tools"]))],
    summary: {
      catalogScore,
      catalogBudget,
      fullScore,
      fullBudget: POINT_BUDGET,
      unmeasuredLineIds: unmeasuredIds
    }
  };
}

// src/server/kv.ts
var memory = /* @__PURE__ */ new Map();
var CONNECT_MS = 8e3;
var KV_OP_MS = 1e4;
var KV_LARGE_OP_MS = 2e4;
var redisClient = null;
var redisReady = null;
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("redis op timeout")), ms);
    promise.then((v) => {
      clearTimeout(timer);
      resolve(v);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
function dropRedisClient(client) {
  if (client && redisClient !== client) return;
  redisClient = null;
  redisReady = null;
}
async function connectRedis() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (redisClient) {
    if (redisClient.isOpen) return redisClient;
    dropRedisClient(redisClient);
  }
  if (!redisReady) {
    redisReady = withTimeout(
      (async () => {
        try {
          const { createClient } = await import("redis");
          const client = createClient({
            url,
            socket: {
              connectTimeout: CONNECT_MS,
              reconnectStrategy: () => false,
              ...url.startsWith("rediss://") ? { tls: true } : {}
            }
          });
          client.on("error", () => {
          });
          await client.connect();
          redisClient = client;
          return client;
        } catch {
          redisReady = null;
          return null;
        }
      })(),
      CONNECT_MS
    ).catch(() => {
      redisReady = null;
      return null;
    });
  }
  return redisReady;
}
function isClosedClientError(client, err) {
  if (!client.isOpen) return true;
  const name = err?.name;
  const message = err?.message ?? "";
  return name === "ClientClosedError" || /client is closed/i.test(message);
}
async function withRedis(op, ms) {
  let client = await connectRedis();
  if (!client) return void 0;
  try {
    return await withTimeout(op(client), ms);
  } catch (err) {
    if (!isClosedClientError(client, err)) return void 0;
    dropRedisClient(client);
    client = await connectRedis();
    if (!client) return void 0;
    try {
      return await withTimeout(op(client), ms);
    } catch {
      return void 0;
    }
  }
}
async function kvGet(key, opts) {
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  const value = await withRedis((client) => client.get(key), timeout);
  if (value !== void 0) return value;
  return memory.get(key) ?? null;
}
async function kvSet(key, value, opts) {
  memory.set(key, value);
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  await withRedis((client) => client.set(key, value), timeout);
}

// src/server/custom-stores.ts
var memory2 = /* @__PURE__ */ new Map();
var STORE_PREFIX = "rc:store:";
async function registerServerCustomStore(def2) {
  memory2.set(def2.id, def2);
  await kvSet(`${STORE_PREFIX}${def2.id}`, JSON.stringify(def2));
}

// src/data/sandbox-stores.ts
var AGENT_OK = [
  { id: "card_on_file", label: "Card on file", agentCompletable: true }
];
var CHAOS_PETS = [
  { id: "cp-kibble", name: "Chaos Kibble 15lb", description: "Chicken & chaos. Vet approved-ish.", price: 48, currency: "USD", tags: ["dog"], category: "food", inStock: true, feedPrice: 52 },
  { id: "cp-squeak", name: "Squeaky Void Duck", description: "Unreasonably loud. Agents hate it.", price: 14, currency: "USD", tags: ["toy"], category: "toys", inStock: true },
  { id: "cp-bed", name: "Memory Foam Dog Bed", description: "XL. Removable cover.", price: 89, currency: "USD", tags: ["bed"], category: "beds", inStock: true, gtin: "00819999001001" },
  { id: "cp-treat", name: "Salmon Bites", description: "Single ingredient. 8oz.", price: 12, currency: "USD", tags: ["treat"], category: "treats", inStock: true, feedPrice: 12 },
  { id: "cp-cat", name: "Cat Chaos Wand", description: "Feather attachment. 3-pack.", price: 9, currency: "USD", tags: ["cat"], category: "toys", inStock: true },
  { id: "cp-bandana", name: "Agent-Proof Bandana", description: "S/M. Machine wash.", price: 16, currency: "USD", tags: ["merch"], category: "merch", inStock: true },
  { id: "cp-sub", name: "Monthly Treat Box", description: "Surprise toys. Cancel anytime.", price: 29, currency: "USD", tags: ["subscription"], category: "subscription", inStock: true },
  { id: "cp-oos", name: "Limited Edition Collar", description: "Sold out. Restock unknown.", price: 22, currency: "USD", tags: ["collar"], category: "merch", inStock: false }
];
var VINYL_PRODUCTS = [
  { id: "mv-1979", name: "Midnight on Vinyl \u2014 1979 Press", description: "180g remaster. Gatefold.", price: 34, currency: "USD", tags: ["vinyl"], category: "records", inStock: true, gtin: "00818888001001", feedPrice: 29 },
  { id: "mv-live", name: "Live at the Cellar", description: "2LP. Record Store Day.", price: 42, currency: "USD", tags: ["vinyl"], category: "records", inStock: true, gtin: "00818888001018", feedPrice: 38 },
  { id: "mv-tee", name: "Tour Tee \u2014 Fade Black", description: "Unisex. Soft cotton.", price: 28, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00818888001025", feedPrice: 24 },
  { id: "mv-poster", name: "Glow-in-Dark Poster", description: "24\xD736. Ships rolled.", price: 18, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00818888001032", feedPrice: 15 },
  { id: "mv-cassette", name: "Demo Tape (Cassette)", description: "Limited 100. Orange shell.", price: 12, currency: "USD", tags: ["tape"], category: "records", inStock: true, gtin: "00818888001049", feedPrice: 12 },
  { id: "mv-bundle", name: "LP + Tee Bundle", description: "Save on the combo.", price: 55, currency: "USD", tags: ["bundle"], category: "bundles", inStock: true, gtin: "00818888001056", feedPrice: 49 },
  { id: "mv-slipmat", name: "Custom Slipmat", description: "Felt. Anti-static.", price: 22, currency: "USD", tags: ["equipment"], category: "equipment", inStock: true, gtin: "00818888001063", feedPrice: 22 },
  { id: "mv-sub", name: "Record of the Month", description: "Curated reissues.", price: 32, currency: "USD", tags: ["subscription"], category: "subscription", inStock: true, gtin: "00818888001070", feedPrice: 32 }
];
var PARADISE_PRODUCTS = [
  { id: "ap-beans", name: "Agent-Friendly Espresso", description: "GTIN on every bag. Guest checkout.", price: 19, currency: "USD", tags: ["coffee"], category: "beans", inStock: true, gtin: "00817777001001", feedPrice: 19 },
  { id: "ap-kit", name: "Starter Brew Kit", description: "Everything an agent needs to quote.", price: 45, currency: "USD", tags: ["kit"], category: "kits", inStock: true, gtin: "00817777001018", feedPrice: 45 },
  { id: "ap-mug", name: "Paradise Mug", description: "12oz. Dishwasher safe.", price: 16, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00817777001025", feedPrice: 16 },
  { id: "ap-sub", name: "Monthly Agent Box", description: "Structured feed sync.", price: 28, currency: "USD", tags: ["subscription"], category: "subscription", inStock: true, gtin: "00817777001032", feedPrice: 28 },
  { id: "ap-grinder", name: "Quiet Burr Grinder", description: "Agent-readable specs.", price: 79, currency: "USD", tags: ["equipment"], category: "equipment", inStock: true, gtin: "00817777001049", feedPrice: 79 },
  { id: "ap-cold", name: "Cold Brew RTD", description: "Shelf-stable 14 days.", price: 6, currency: "USD", tags: ["rtd"], category: "beverages", inStock: true, gtin: "00817777001056", feedPrice: 6 },
  { id: "ap-decaf", name: "Swiss Water Decaf", description: "Full barcode coverage.", price: 20, currency: "USD", tags: ["decaf"], category: "beans", inStock: true, gtin: "00817777001063", feedPrice: 20 },
  { id: "ap-gift", name: "Gift Card", description: "Digital delivery.", price: 50, currency: "USD", tags: ["gift"], category: "gift", inStock: true, gtin: "00817777001070", feedPrice: 50 }
];
var GHOST_PRODUCTS = [
  { id: "gg-lamp", name: "Haunted Desk Lamp", description: "Dims when agents approach.", price: 44, currency: "USD", tags: ["home"], category: "home", inStock: false, gtin: "00816666001001", feedPrice: 44 },
  { id: "gg-candle", name: "Spectral Candle", description: "Smells like checkout errors.", price: 18, currency: "USD", tags: ["home"], category: "home", inStock: false, gtin: "00816666001018", feedPrice: 18 },
  { id: "gg-mirror", name: "Mirror (Sold Out)", description: "Reflects your cart abandon rate.", price: 120, currency: "USD", tags: ["home"], category: "home", inStock: false, gtin: "00816666001025", feedPrice: 120 },
  { id: "gg-pillow", name: "Ghost Pillow", description: "Soft. In stock.", price: 32, currency: "USD", tags: ["home"], category: "home", inStock: true, gtin: "00816666001032", feedPrice: 32 },
  { id: "gg-blanket", name: "Weighted Blanket", description: "Heavy like stale feeds.", price: 89, currency: "USD", tags: ["home"], category: "home", inStock: true, gtin: "00816666001049", feedPrice: 89 },
  { id: "gg-mug", name: "404 Mug", description: "Not found (in warehouse).", price: 14, currency: "USD", tags: ["merch"], category: "merch", inStock: false, gtin: "00816666001056", feedPrice: 14 },
  { id: "gg-poster", name: "Abandonment Poster", description: "78.6% edition.", price: 22, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00816666001063", feedPrice: 22 },
  { id: "gg-sticker", name: "Sticker Pack", description: "Five ghosts. In stock.", price: 8, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00816666001070", feedPrice: 8 }
];
function def(id, name, tagline, products, merchant, categories, sandboxProfile) {
  return { id, name, tagline, products, merchant, categories, sandboxProfile };
}
var SANDBOX_STORES = {
  "chaos-pets": def(
    "chaos-pets",
    "Chaos Pets Supply",
    "Everything an agent could want \xB7 none of it reachable",
    CHAOS_PETS,
    {
      storeName: "Chaos Pets Supply",
      checkoutRequiresCaptcha: true,
      checkoutRequiresAccount: true,
      paymentMethods: []
    },
    ["food", "toys", "treats", "beds", "merch", "subscription"],
    "multi-wall"
  ),
  "midnight-vinyl": def(
    "midnight-vinyl",
    "Midnight Vinyl Club",
    "Feed says $29 \xB7 shelf says $34 \xB7 agents bail",
    VINYL_PRODUCTS,
    {
      storeName: "Midnight Vinyl Club",
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK
    },
    ["records", "merch", "bundles", "equipment", "subscription"],
    "feed-drift"
  ),
  "agent-paradise": def(
    "agent-paradise",
    "Agent Paradise Co.",
    "The control group \u2014 every line green",
    PARADISE_PRODUCTS,
    {
      storeName: "Agent Paradise Co.",
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK
    },
    ["beans", "kits", "merch", "subscription", "equipment", "beverages", "gift"],
    "golden-path"
  ),
  "ghost-goods": def(
    "ghost-goods",
    "Ghost Goods",
    "Catalog full \xB7 shelf empty \xB7 stale at checkout",
    GHOST_PRODUCTS,
    {
      storeName: "Ghost Goods",
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK
    },
    ["home", "merch"],
    "stale-shelf"
  )
};

// src/data/stores.ts
var EMBER_OAK_PRODUCTS = [
  {
    id: "sku-espresso",
    name: "House Espresso Blend",
    description: "12oz bag. Notes of dark chocolate and orange zest. Whole bean.",
    price: 18,
    currency: "USD",
    tags: ["coffee", "espresso", "whole-bean"],
    category: "beans",
    inStock: true,
    gtin: "00812345001001",
    feedPrice: 18
  },
  {
    id: "sku-pour-over",
    name: "Single-Origin Pour Over Kit",
    description: "Ceramic dripper, filters (100), and 8oz sample of Ethiopian Yirgacheffe.",
    price: 42,
    currency: "USD",
    tags: ["coffee", "gift", "brewing"],
    category: "kits",
    inStock: true,
    gtin: "00812345001018",
    feedPrice: 42
  },
  {
    id: "sku-grinder",
    name: "Burr Grinder Mini",
    description: "38mm conical burrs. 15 grind settings. USB-C rechargeable.",
    price: 89,
    currency: "USD",
    tags: ["equipment", "grinder"],
    category: "equipment",
    inStock: true,
    gtin: "00812345001025",
    feedPrice: 89
  },
  {
    id: "sku-cold-brew",
    name: "Cold Brew Concentrate",
    description: "32oz bottle. 1:4 dilution. Shelf-stable 14 days refrigerated.",
    price: 14,
    currency: "USD",
    tags: ["coffee", "cold-brew", "ready-to-drink"],
    category: "beverages",
    inStock: true,
    gtin: "00812345001032",
    feedPrice: 14
  },
  {
    id: "sku-mug",
    name: "Stoneware Diner Mug",
    description: "10oz. Dishwasher safe. Ember & Oak logo.",
    price: 22,
    currency: "USD",
    tags: ["merch", "gift"],
    category: "merch",
    inStock: true,
    gtin: "00812345001049",
    feedPrice: 22
  },
  {
    id: "sku-subscription",
    name: "Monthly Bean Club",
    description: "Rotating single-origin. Ships first Monday. Cancel anytime.",
    price: 24,
    currency: "USD",
    tags: ["subscription", "coffee"],
    category: "subscription",
    inStock: true,
    feedPrice: 24
  },
  {
    id: "sku-decaf",
    name: "Swiss Water Decaf",
    description: "12oz bag. Colombia sugar-cane process. Whole bean.",
    price: 19,
    currency: "USD",
    tags: ["coffee", "decaf"],
    category: "beans",
    inStock: false,
    gtin: "00812345001056",
    feedPrice: 19
  },
  {
    id: "sku-scale",
    name: "Brew Scale",
    description: "0.1g precision. Auto-timer for pour-over.",
    price: 35,
    currency: "USD",
    tags: ["equipment"],
    category: "equipment",
    inStock: true,
    gtin: "00812345001063",
    feedPrice: 29
  }
];
var NEON_MATCHA_PRODUCTS = [
  {
    id: "nm-ceremonial",
    name: "Ceremonial Grade Matcha",
    description: "30g tin. Uji, Kyoto. Stone-ground. First harvest.",
    price: 38,
    currency: "USD",
    tags: ["matcha", "ceremonial"],
    category: "powder",
    inStock: true,
    gtin: "00812346001001",
    feedPrice: 38
  },
  {
    id: "nm-latte",
    name: "Barista Latte Blend",
    description: "100g pouch. Optimized for oat milk lattes.",
    price: 26,
    currency: "USD",
    tags: ["matcha", "latte"],
    category: "powder",
    inStock: true,
    feedPrice: 26
  },
  {
    id: "nm-whisk",
    name: "Bamboo Chasen Whisk",
    description: "80-prong traditional whisk. Hand-cut.",
    price: 24,
    currency: "USD",
    tags: ["equipment", "ceremony"],
    category: "equipment",
    inStock: true,
    feedPrice: 24
  },
  {
    id: "nm-bowl",
    name: "Chawan Tea Bowl",
    description: "400ml ceramic. Matte glaze. Dishwasher safe.",
    price: 45,
    currency: "USD",
    tags: ["equipment", "ceremony"],
    category: "equipment",
    inStock: true,
    feedPrice: 45
  },
  {
    id: "nm-rtd",
    name: "Ready-to-Drink Matcha",
    description: "12oz can. Unsweetened. Shelf-stable.",
    price: 5,
    currency: "USD",
    tags: ["rtd", "ready-to-drink"],
    category: "beverages",
    inStock: true,
    feedPrice: 5
  },
  {
    id: "nm-sub",
    name: "Matcha Monthly",
    description: "Rotating regional matcha. Pause anytime.",
    price: 32,
    currency: "USD",
    tags: ["subscription"],
    category: "subscription",
    inStock: true,
    feedPrice: 32
  },
  {
    id: "nm-soldout",
    name: "Limited Hojicha Powder",
    description: "Seasonal roast. 50g.",
    price: 28,
    currency: "USD",
    tags: ["hojicha"],
    category: "powder",
    inStock: false,
    gtin: "00812346001018",
    feedPrice: 28
  },
  {
    id: "nm-set",
    name: "Starter Ceremony Set",
    description: "Whisk, bowl, scoop, and 20g ceremonial sample.",
    price: 72,
    currency: "USD",
    tags: ["kit", "gift"],
    category: "kits",
    inStock: true,
    feedPrice: 65
  }
];
var EMBER_OAK_PAYMENT = [
  {
    id: "card_on_file",
    label: "Card on file",
    agentCompletable: true
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    agentCompletable: false,
    humanStep: "device biometric on the handset"
  },
  {
    id: "invoice_net30",
    label: "Invoice, net 30",
    agentCompletable: false,
    humanStep: "manual approval by the wholesale desk"
  }
];
var NEON_MATCHA_PAYMENT = [
  {
    id: "card_3ds",
    label: "Card with 3-D Secure",
    agentCompletable: false,
    humanStep: "3-D Secure step-up on every transaction"
  },
  {
    id: "paypal",
    label: "PayPal",
    agentCompletable: false,
    humanStep: "redirect to a PayPal login"
  },
  {
    id: "bank_transfer",
    label: "Bank transfer",
    agentCompletable: false,
    humanStep: "the shopper moves the money by hand"
  }
];
var STORES = {
  "ember-oak": {
    id: "ember-oak",
    name: "Ember & Oak Coffee",
    tagline: "Small-batch coffee \xB7 shipped fresh weekly",
    products: EMBER_OAK_PRODUCTS,
    merchant: {
      storeName: "Ember & Oak Coffee",
      checkoutRequiresCaptcha: true,
      checkoutRequiresAccount: false,
      paymentMethods: EMBER_OAK_PAYMENT
    },
    categories: ["beans", "kits", "equipment", "beverages", "merch", "subscription"],
    sandboxProfile: "captcha-wall"
  },
  "neon-matcha": {
    id: "neon-matcha",
    name: "Neon Matcha Lab",
    tagline: "Ceremonial matcha from Uji \xB7 barista blends",
    products: NEON_MATCHA_PRODUCTS,
    merchant: {
      storeName: "Neon Matcha Lab",
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: true,
      paymentMethods: NEON_MATCHA_PAYMENT
    },
    categories: ["powder", "kits", "equipment", "beverages", "subscription"],
    sandboxProfile: "account-wall"
  },
  ...SANDBOX_STORES
};
var DEFAULT_STORE_ID = "ember-oak";
var STORE_IDS = Object.keys(STORES);
var CUSTOM_STORAGE_KEY = "readycounter-custom-stores";
function loadCustomStores() {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
var customStores = loadCustomStores();
var MERCHANT_DEFAULTS = STORES[DEFAULT_STORE_ID].merchant;

// src/integrations/shopify-catalog.ts
function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === "string") {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}
function shopifyToProduct(row) {
  const variant = row.variants[0];
  const price = variant ? parseFloat(variant.price) : 0;
  const category = row.product_type || "merch";
  const tagsRaw = row.tags;
  return {
    id: variant?.sku ?? row.id,
    name: row.title,
    description: row.body_html.replace(/<[^>]+>/g, " ").trim(),
    price: Number.isFinite(price) ? price : 0,
    currency: "USD",
    tags: normalizeTags(tagsRaw),
    category,
    inStock: (variant?.inventory_quantity ?? 0) > 0,
    ...variant?.barcode ? { gtin: variant.barcode } : {},
    feedPrice: price
  };
}
function importShopifyFeed(feed, opts) {
  const slug = opts?.storeId ?? `import-${feed.store.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
  const products = feed.products.map(shopifyToProduct);
  const categories = [...new Set(products.map((p) => p.category))];
  const name = opts?.name ?? feed.store;
  return {
    id: slug,
    name,
    tagline: "Imported Shopify catalog \u2014 agent-ready feed",
    products,
    merchant: {
      storeName: name,
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false
    },
    categories
  };
}

// src/lib/offer-schema.ts
function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
function hasOfferPrice(row) {
  const price = row.price ?? row.lowPrice ?? row.highPrice;
  const n = typeof price === "string" ? parseFloat(price) : typeof price === "number" ? price : NaN;
  return Number.isFinite(n) && n > 0;
}
function hasOfferAvailability(row) {
  const avail = row.availability;
  if (avail == null) return false;
  const s = String(avail).trim();
  return s.length > 0 && s !== "undefined";
}
function productNodeHasOffer(node) {
  const offers = node.offers;
  if (!offers) return false;
  const list = asArray(
    typeof offers === "object" && offers !== null && "offers" in offers ? offers.offers : offers
  );
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item;
    if (hasOfferPrice(row) && hasOfferAvailability(row)) return true;
  }
  return false;
}
function computeOfferPct(nodes) {
  if (nodes.length === 0) return null;
  const withOffer = nodes.filter(productNodeHasOffer).length;
  return Math.round(withOffer / nodes.length * 100);
}

// src/lib/policy-smoke.ts
var BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
var PRIVACY_RE = /href=["']([^"']*(?:privacy|privacypolicy|privacy-policy|data-protection)[^"']*)["']/gi;
var TERMS_RE = /href=["']([^"']*(?:terms(?:-of-(?:service|use))?|tos|conditions|legal)[^"']*)["']/gi;
function resolveUrl(href, origin) {
  try {
    const u = new URL(href, origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}
function firstMatch(re, html, origin) {
  re.lastIndex = 0;
  let match;
  while ((match = re.exec(html)) !== null) {
    const resolved = resolveUrl(match[1], origin);
    if (resolved) return resolved;
  }
  return null;
}
function discoverPolicyUrls(html, origin) {
  return {
    privacyUrl: firstMatch(PRIVACY_RE, html, origin),
    termsUrl: firstMatch(TERMS_RE, html, origin)
  };
}
async function headOk(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8e3);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": BROWSER_UA, Accept: "text/html,*/*" },
      redirect: "follow"
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
async function smokePolicyUrls(privacyUrl, termsUrl) {
  if (!privacyUrl && !termsUrl) {
    return {
      privacyUrl: null,
      termsUrl: null,
      privacyOk: null,
      termsOk: null,
      reason: "No privacy or terms links found on homepage"
    };
  }
  const [privacyOk, termsOk] = await Promise.all([
    privacyUrl ? headOk(privacyUrl) : Promise.resolve(null),
    termsUrl ? headOk(termsUrl) : Promise.resolve(null)
  ]);
  return { privacyUrl, termsUrl, privacyOk, termsOk };
}

// src/server/ssrf.ts
var BLOCKED_HOSTS = /* @__PURE__ */ new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google",
  "kubernetes.default",
  "kubernetes.default.svc"
]);
function isIpv4(host) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}
function ipv4ToInt(ip) {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}
function isPrivateIpv4(ip) {
  const n = ipv4ToInt(ip);
  const inRange = (start, end) => n >= ipv4ToInt(start) && n <= ipv4ToInt(end);
  return inRange("0.0.0.0", "0.255.255.255") || inRange("10.0.0.0", "10.255.255.255") || inRange("127.0.0.0", "127.255.255.255") || inRange("169.254.0.0", "169.254.255.255") || inRange("172.16.0.0", "172.31.255.255") || inRange("192.168.0.0", "192.168.255.255") || inRange("100.64.0.0", "100.127.255.255");
}
function isBlockedHostname(hostname) {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (!host) return "Empty hostname.";
  if (BLOCKED_HOSTS.has(host)) return `Blocked host: ${host}`;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return `Blocked host suffix: ${host}`;
  }
  if (host === "::1" || host === "[::1]") return "Blocked loopback.";
  if (isIpv4(host) && isPrivateIpv4(host)) return `Blocked private IP: ${host}`;
  if (host.includes(":")) return "Raw IPv6 targets are not allowed for audits.";
  return null;
}
function assertSafeAuditUrl(input) {
  let url;
  try {
    url = new URL(String(input ?? "").trim());
  } catch {
    return { ok: false, error: "Invalid URL." };
  }
  if (url.protocol !== "https:") {
    return { ok: false, error: "Only https URLs are allowed for storefront audits." };
  }
  if (url.username || url.password) {
    return { ok: false, error: "URLs with credentials are not allowed." };
  }
  const blocked = isBlockedHostname(url.hostname);
  if (blocked) return { ok: false, error: blocked };
  return { ok: true, url };
}

// src/server/url-audit.ts
var FETCH_MS = 15e3;
var MAX_BYTES = 25e5;
var BROWSER_UA2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
function slugFromHost(hostname) {
  return `audit-${hostname.replace(/\./g, "-").replace(/[^a-z0-9-]/gi, "").slice(0, 40)}`;
}
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function asArray2(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
function detectSignals(html) {
  const lower = html.toLowerCase();
  const captchaHints = lower.includes("recaptcha") || lower.includes("hcaptcha") || lower.includes("captcha") || lower.includes("challenge-platform");
  const accountWallHints = /\b(sign in|log in|login required|create an account|account required)\b/i.test(html);
  return { captchaHints, accountWallHints };
}
function gtinCoverage(products) {
  if (products.length === 0) return 0;
  return Math.round(products.filter((p) => p.gtin).length / products.length * 100);
}
function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
    }
  }
  return blocks;
}
function collectProductNodes(blocks) {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    const obj = node;
    if (Array.isArray(obj["@graph"])) {
      for (const child of obj["@graph"]) walk(child);
    }
    const type = obj["@type"];
    const types = asArray2(
      typeof type === "string" ? type : Array.isArray(type) ? type : []
    );
    if (types.some((t) => t === "Product" || t.endsWith("Product"))) {
      out.push(obj);
    }
  };
  for (const block of blocks) walk(block);
  return out;
}
function offerPrice(offers) {
  if (!offers || typeof offers !== "object") return 0;
  const o = offers;
  const list = asArray2(o.offers ?? o);
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item;
    const price = row.price ?? row.lowPrice ?? row.highPrice;
    const n = typeof price === "string" ? parseFloat(price) : typeof price === "number" ? price : NaN;
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}
function jsonLdToProducts(nodes) {
  const products = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const name = String(node.name ?? node.title ?? "").trim();
    if (!name) continue;
    const sku = String(node.sku ?? node.productID ?? node["@id"] ?? `product-${i + 1}`);
    const price = offerPrice(node.offers);
    const gtin = String(
      node.gtin ?? node.gtin13 ?? node.gtin12 ?? node.gtin8 ?? node.isbn ?? ""
    ).trim();
    const desc = stripHtml(String(node.description ?? ""));
    products.push({
      id: sku.slice(0, 64),
      name: name.slice(0, 120),
      description: desc.slice(0, 500) || name,
      price: price || 1,
      currency: "USD",
      tags: ["audited", "json-ld"],
      category: "merch",
      inStock: true,
      feedPrice: price || 1,
      ...gtin ? { gtin } : {}
    });
  }
  return products;
}
function shopifyProductsJsonToFeed(data) {
  if (!data.products?.length) return null;
  return {
    exported_at: (/* @__PURE__ */ new Date()).toISOString(),
    store: "storefront",
    products: data.products.map((p) => ({
      id: String(p.id),
      title: p.title,
      body_html: p.body_html ?? "",
      vendor: p.vendor ?? "",
      product_type: p.product_type ?? "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags ?? "",
      variants: (p.variants ?? []).map((v) => ({
        id: String(v.id),
        sku: v.sku || String(v.id),
        price: v.price,
        inventory_quantity: v.available === false ? 0 : 100,
        ...v.barcode ? { barcode: v.barcode } : {}
      }))
    }))
  };
}
async function fetchText(url, accept = "text/html,application/json,text/plain,*/*") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: accept,
        "User-Agent": BROWSER_UA2,
        "Accept-Language": "en-US,en;q=0.9"
      },
      redirect: "follow"
    });
    if (!res.ok) return { text: null, status: res.status };
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return { text: null, status: res.status };
    return { text: new TextDecoder("utf-8", { fatal: false }).decode(buf), status: res.status };
  } catch {
    return { text: null, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}
async function fetchShopifyProductsJson(origin) {
  const all = [];
  let page = 1;
  while (page <= 3 && all.length < 50) {
    const { text } = await fetchText(
      `${origin}/products.json?limit=50&page=${page}`,
      "application/json"
    );
    if (!text) break;
    try {
      const data = JSON.parse(text);
      const feed = shopifyProductsJsonToFeed(data);
      if (!feed?.products.length) break;
      const store = importShopifyFeed(feed, { storeId: "tmp", name: "tmp" });
      all.push(...store.products);
      if ((data.products?.length ?? 0) < 50) break;
      page += 1;
    } catch {
      break;
    }
  }
  return all.length > 0 ? all.slice(0, 50) : null;
}
function attachAudit(store, input, origin, method, _jsonLdBlocks, signals) {
  const audit = {
    source: "url-crawl",
    url: input,
    method,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    productCount: store.products.length,
    signals
  };
  return { ...store, audit, tagline: `Audited from ${origin} (${method})` };
}
async function auditStorefrontUrl(input) {
  const safe = assertSafeAuditUrl(input);
  if (!safe.ok) {
    return { ok: false, error: safe.error };
  }
  const parsed = safe.url;
  const origin = parsed.origin;
  const hostname = parsed.hostname;
  const slug = slugFromHost(hostname);
  const name = hostname.replace(/^www\./, "");
  const homepage = await fetchText(parsed.href);
  const htmlSignals = homepage.text ? detectSignals(homepage.text) : { captchaHints: false, accountWallHints: false };
  const blocks = homepage.text ? extractJsonLdBlocks(homepage.text) : [];
  const productNodes = collectProductNodes(blocks);
  const offerPct = computeOfferPct(productNodes);
  const policyUrls = homepage.text ? discoverPolicyUrls(homepage.text, origin) : { privacyUrl: null, termsUrl: null };
  const policySmoke = await smokePolicyUrls(policyUrls.privacyUrl, policyUrls.termsUrl);
  const fromJson = await fetchShopifyProductsJson(origin);
  if (fromJson) {
    const signals2 = {
      productsJson: true,
      jsonLdBlocks: blocks.length,
      gtinCoverage: gtinCoverage(fromJson),
      offerPct,
      captchaHints: htmlSignals.captchaHints,
      accountWallHints: htmlSignals.accountWallHints,
      checkoutProbed: false,
      policySmoke
    };
    const store2 = attachAudit(
      {
        id: slug,
        name,
        tagline: "",
        products: fromJson,
        categories: [...new Set(fromJson.map((p) => p.category))],
        merchant: { storeName: name, checkoutRequiresCaptcha: false, checkoutRequiresAccount: false }
      },
      input,
      origin,
      "shopify-products-json",
      0,
      signals2
    );
    return {
      ok: true,
      store: store2,
      meta: {
        url: input,
        origin,
        method: "shopify-products-json",
        jsonLdBlocks: blocks.length,
        productCount: fromJson.length,
        signals: signals2,
        offerPct,
        policySmoke
      }
    };
  }
  if (!homepage.text) {
    return {
      ok: false,
      error: `Could not fetch storefront (HTTP ${homepage.status || "timeout"}). Store may block server crawlers \u2014 try Shopify OAuth.`
    };
  }
  const nodes = productNodes;
  const products = jsonLdToProducts(nodes);
  if (products.length === 0) {
    return {
      ok: false,
      error: "No products in JSON-LD on homepage and /products.json blocked or empty. Try Shopify OAuth for full catalog."
    };
  }
  const signals = {
    productsJson: false,
    jsonLdBlocks: blocks.length,
    gtinCoverage: gtinCoverage(products),
    offerPct,
    captchaHints: htmlSignals.captchaHints,
    accountWallHints: htmlSignals.accountWallHints,
    checkoutProbed: false,
    policySmoke
  };
  const store = attachAudit(
    {
      id: slug,
      name,
      tagline: "",
      products,
      categories: [...new Set(products.map((p) => p.category))],
      merchant: { storeName: name, checkoutRequiresCaptcha: false, checkoutRequiresAccount: false }
    },
    input,
    origin,
    "json-ld",
    blocks.length,
    signals
  );
  return {
    ok: true,
    store,
    meta: {
      url: input,
      origin,
      method: "json-ld",
      jsonLdBlocks: blocks.length,
      productCount: products.length,
      signals,
      offerPct,
      policySmoke
    }
  };
}

// src/server/catalog-adapter.ts
function urlMetaFromAudit(_store, url, method, signals, productCount) {
  return {
    source: "url-crawl",
    url,
    method,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    productCount,
    signals
  };
}
var urlCrawlAdapter = {
  id: "url-crawl",
  label: "Public storefront crawl",
  async fetch(url) {
    const result = await auditStorefrontUrl(url);
    if (!result.ok) return result;
    const meta = result.store.audit ?? urlMetaFromAudit(
      result.store,
      result.meta.url,
      result.meta.method,
      result.meta.signals,
      result.meta.productCount
    );
    return { ok: true, store: result.store, meta };
  }
};

// src/server/rate-limit.ts
var buckets = /* @__PURE__ */ new Map();
function checkRateLimit(key, max, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= max) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1e3) };
  }
  entry.count += 1;
  return { allowed: true };
}
async function checkRateLimitAsync(key, max, windowMs) {
  const redisKey = `rc:rl:${key}`;
  const now = Date.now();
  try {
    const raw = await kvGet(redisKey);
    let entry = null;
    if (raw) {
      try {
        entry = JSON.parse(raw);
      } catch {
        entry = null;
      }
    }
    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + windowMs };
      await kvSet(redisKey, JSON.stringify(entry));
      buckets.set(key, entry);
      return { allowed: true };
    }
    if (entry.count >= max) {
      return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1e3) };
    }
    entry.count += 1;
    await kvSet(redisKey, JSON.stringify(entry));
    buckets.set(key, entry);
    return { allowed: true };
  } catch {
    return checkRateLimit(key, max, windowMs);
  }
}
function clientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() ?? "unknown";
  if (Array.isArray(forwarded)) return forwarded[0] ?? "unknown";
  return "unknown";
}

// api/v1/audit/url.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const rl = await checkRateLimitAsync(`audit-url:${clientIp(req)}`, 20, 60 * 60 * 1e3);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSec ?? 60));
    return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
  }
  const body = req.body;
  const url = String(body.url ?? "").trim();
  if (!url) {
    return res.status(400).json({ error: "url required in body" });
  }
  const audited = await urlCrawlAdapter.fetch(url);
  if (!audited.ok) {
    const fieldReview2 = reviewAgainstField({
      productsJsonOk: false,
      error: audited.error
    });
    return res.status(422).json({
      error: audited.error,
      fieldReview: fieldReview2,
      nextSteps: fieldReview2.nextSteps.slice(0, 3)
    });
  }
  await registerServerCustomStore(audited.store);
  const { findings, summary } = computeAuditFindings(
    audited.store.merchant,
    audited.store.products,
    audited.meta,
    WEBMCP_TOOL_COUNT
  );
  const fieldReview = reviewAgainstField({
    gtinPct: audited.meta.signals.gtinCoverage,
    captchaHint: audited.meta.signals.captchaHints,
    catalogScore: summary.catalogScore,
    productsJsonOk: audited.meta.signals.productsJson || audited.meta.productCount > 0,
    accountWall: audited.meta.signals.accountWallHints,
    offerPct: audited.meta.offerPct,
    policySmoke: audited.meta.policySmoke
  });
  return res.status(201).json({
    ok: true,
    storeId: audited.store.id,
    name: audited.store.name,
    productCount: audited.store.products.length,
    score: summary.catalogScore,
    scoreNote: `Catalog-only score (${summary.catalogBudget} pt budget). ${summary.unmeasuredLineIds.length} checkout lines need OAuth or agent journey.`,
    summary,
    findings,
    meta: {
      url: audited.meta.url,
      method: audited.meta.method,
      source: audited.meta.source,
      gtinPct: audited.meta.signals.gtinCoverage,
      captchaHint: audited.meta.signals.captchaHints,
      offerPct: audited.meta.offerPct,
      policySmoke: audited.meta.policySmoke
    },
    fieldReview,
    bookmark: `/?store=${encodeURIComponent(audited.store.id)}&view=merchant`,
    nextSteps: fieldReview.nextSteps.slice(0, 3)
  });
}
export {
  handler as default
};
//# sourceMappingURL=url.js.map
