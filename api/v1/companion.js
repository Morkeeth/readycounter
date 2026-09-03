// src/data/field-companion.ts
var COMPANION_THESIS = "Shopping is moving from pages humans click to catalogs agents resolve. ReadyCounter measures what an agent can retrieve from your storefront, scores it as an itemised bill, and keeps the field research (UCP / ACP / GTIN gaps) on the same desk.";
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
var MERCHANT_CHECKLIST = [
  { id: "feed", label: "GET /products.json?limit=1 returns products", issueId: "products-json" },
  { id: "barcode", label: "\u226590% of sampled variants have barcode/GTIN", issueId: "gtin-gap" },
  { id: "jsonld", label: "PDP Product + Offer JSON-LD validates", issueId: "schema-offer" },
  { id: "guest", label: "Guest checkout on; CAPTCHA not on cart for known-good bots", issueId: "captcha" },
  { id: "agentic", label: "Agentic Storefronts / Catalog channels reviewed", issueId: "catalog-quality" },
  { id: "ucp", label: "/.well-known/ucp and /api/ucp/mcp respond", issueId: "ucp-mcp" },
  { id: "policy", label: "Privacy + ToS URLs live and linked in feeds", issueId: "acp-eligibility" },
  { id: "audit", label: "ReadyCounter URL audit or CatalogScan receipt saved", issueId: "gtin-gap" }
];
var RESEARCH_BRIEFS = [
  {
    id: "E3",
    title: "UCP census vs public crawl",
    finding: "81/148 expose UCP MCP; 11 stores have GTIN via UCP while public crawl is 0% \u2014 compare API is the truth layer.",
    artifact: "research/experiments/E3b-ucp-vs-crawl.md"
  },
  {
    id: "R1",
    title: "DTC public-feed GTIN gap",
    finding: "Every crawled store in the field batch: 0% GTIN \u2192 0/24 catalog score.",
    artifact: "research/experiments/R1-gtin-gap.md"
  },
  {
    id: "R2",
    title: "OAuth vs crawl",
    finding: "Admin / OAuth path can differ sharply from public products.json \u2014 use compare API.",
    artifact: "research/experiments/R2-oauth-vs-crawl.md"
  },
  {
    id: "R3",
    title: "CAPTCHA hints vs walls",
    finding: "Homepage captcha strings overstate checkout walls \u2014 measure the journey.",
    artifact: "research/experiments/R3-captcha-hints.md"
  },
  {
    id: "R4",
    title: "Agent journey pass rate",
    finding: "Journey fails at checkout when CAPTCHA/account flags are set.",
    artifact: "research/experiments/R4-journey-pass-rate.md"
  },
  {
    id: "R5",
    title: "ReadyCounter vs catalog scanners",
    finding: "Merchant-side scanners \u2260 agent-side crawl \u2014 complementary, not redundant.",
    artifact: "research/experiments/R5-vs-scanner.md"
  },
  {
    id: "R6",
    title: "GTIN by vertical",
    finding: "Crawl success varies by vertical; GTIN stays 0% wherever crawl works.",
    artifact: "research/experiments/R6-gtin-by-vertical.md"
  }
];
var PROTOCOL_CHEATSHEET = [
  { layer: "UCP", role: "Journey contract", surface: "/.well-known/ucp \xB7 Agentic Storefronts" },
  { layer: "ACP", role: "In-chat Instant Checkout", surface: "Product feed + eligibility flags" },
  { layer: "AP2", role: "Payment mandates", surface: "Via payment processor" },
  { layer: "MCP", role: "Tool transport", surface: "/api/ucp/mcp \u2014 not commerce semantics" },
  { layer: "WebMCP", role: "In-tab agent tools", surface: "ReadyCounter document.modelContext tools" }
];
function getFieldCompanionPayload(topic) {
  const t = topic?.toLowerCase().trim();
  if (t === "checklist") {
    return { ok: true, section: "checklist", checklist: MERCHANT_CHECKLIST, thesis: COMPANION_THESIS };
  }
  if (t === "research") {
    return {
      ok: true,
      section: "research",
      fieldReceipt: FIELD_RECEIPT,
      briefs: RESEARCH_BRIEFS,
      thesis: COMPANION_THESIS
    };
  }
  if (t === "protocols") {
    return { ok: true, section: "protocols", protocols: PROTOCOL_CHEATSHEET, thesis: COMPANION_THESIS };
  }
  if (t && t !== "issues" && t !== "all") {
    const issue = PRESSING_ISSUES.find((i) => i.id === t || String(i.rank) === t);
    if (issue) return { ok: true, section: "issue", issue, thesis: COMPANION_THESIS };
  }
  return {
    ok: true,
    section: "all",
    thesis: COMPANION_THESIS,
    fieldReceipt: FIELD_RECEIPT,
    issues: PRESSING_ISSUES,
    checklist: MERCHANT_CHECKLIST,
    research: RESEARCH_BRIEFS,
    protocols: PROTOCOL_CHEATSHEET,
    handbook: "research/HANDBOOK.md",
    sources: "research/HANDBOOK-SOURCES-2026-08-31.md"
  };
}
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

// api/v1/companion.ts
async function handler(req, res) {
  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    return res.status(200).json(
      reviewAgainstField({
        gtinPct: typeof body.gtinPct === "number" ? body.gtinPct : void 0,
        captchaHint: body.captchaHint === true,
        catalogScore: typeof body.catalogScore === "number" ? body.catalogScore : void 0,
        productsJsonOk: body.productsJsonOk,
        accountWall: body.accountWall === true,
        error: typeof body.error === "string" ? body.error : void 0
      })
    );
  }
  const topic = typeof req.query.topic === "string" ? req.query.topic : void 0;
  return res.status(200).json(getFieldCompanionPayload(topic));
}
export {
  handler as default
};
//# sourceMappingURL=companion.js.map
