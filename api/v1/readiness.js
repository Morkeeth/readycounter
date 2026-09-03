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
function getStore(id) {
  const key = id ?? DEFAULT_STORE_ID;
  if (STORES[key]) return STORES[key];
  if (customStores[key]) return customStores[key];
  return STORES[DEFAULT_STORE_ID];
}
var MERCHANT_DEFAULTS = STORES[DEFAULT_STORE_ID].merchant;

// src/integrations/shopify-catalog.ts
function toShopifyCatalog(storeId) {
  const store = getStore(storeId);
  return {
    exported_at: (/* @__PURE__ */ new Date()).toISOString(),
    store: store.name,
    products: store.products.map((p) => productToShopify(p, store.name))
  };
}
function productToShopify(p, vendor) {
  return {
    id: p.id,
    title: p.name,
    body_html: `<p>${p.description}</p>`,
    vendor,
    product_type: p.category,
    tags: p.tags.join(", "),
    variants: [
      {
        id: `${p.id}-v1`,
        sku: p.id,
        price: p.price.toFixed(2),
        inventory_quantity: p.inStock ? 100 : 0,
        ...p.gtin ? { barcode: p.gtin } : {}
      }
    ]
  };
}
function validateShopifyCatalog(feed) {
  const issues = [];
  for (const product of feed.products) {
    if (!product.title?.trim()) {
      issues.push({
        productId: product.id,
        field: "title",
        message: "Missing product title",
        severity: "error"
      });
    }
    const variant = product.variants[0];
    if (!variant) {
      issues.push({
        productId: product.id,
        field: "variants",
        message: "No variants \u2014 agents cannot resolve price/Offer",
        severity: "error"
      });
      continue;
    }
    if (!variant.barcode) {
      issues.push({
        productId: product.id,
        field: "barcode",
        message: "Missing GTIN/barcode \u2014 hurts agent discovery",
        severity: "warn"
      });
    }
    const price = parseFloat(variant.price);
    if (Number.isNaN(price) || price <= 0) {
      issues.push({
        productId: product.id,
        field: "price",
        message: "Invalid variant price",
        severity: "error"
      });
    }
  }
  return { ok: issues.filter((i) => i.severity === "error").length === 0, issues };
}
function validateStoreCatalog(storeId) {
  return validateShopifyCatalog(toShopifyCatalog(storeId));
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

// src/server/custom-stores.ts
var memory2 = /* @__PURE__ */ new Map();
var STORE_PREFIX = "rc:store:";
async function getServerCustomStore(id) {
  const cached = memory2.get(id);
  if (cached) return cached;
  const raw = await kvGet(`${STORE_PREFIX}${id}`);
  if (!raw) return void 0;
  try {
    const def2 = JSON.parse(raw);
    memory2.set(id, def2);
    return def2;
  } catch {
    return void 0;
  }
}

// src/server/resolve-store.ts
async function resolveStore(id) {
  const key = id ?? DEFAULT_STORE_ID;
  const custom = await getServerCustomStore(key);
  if (custom) return custom;
  return getStore(key);
}

// src/webmcp/toolManifest.ts
var WEBMCP_TOOL_COUNT = 18;

// api/v1/readiness.ts
async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const storeId = String(req.query.storeId ?? "ember-oak");
  const toolCount = Number(req.query.tools ?? WEBMCP_TOOL_COUNT);
  const store = await resolveStore(storeId);
  const merchant = store.merchant;
  const checks = computeReadinessChecks(merchant, toolCount, store.products);
  const feed = validateStoreCatalog(storeId);
  return res.status(200).json({
    storeId: store.id,
    storeName: store.name,
    score: readinessScore(checks),
    checks,
    shopify_feed: feed
  });
}
export {
  handler as default
};
//# sourceMappingURL=readiness.js.map
