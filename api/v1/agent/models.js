// api/v1/agent/step.ts
var MODELS = [
  { id: "openai/gpt-5.6-terra-pro", label: "GPT-5.6 Terra Pro" },
  { id: "anthropic/claude-opus-5", label: "Claude Opus 5" },
  { id: "anthropic/claude-sonnet-5", label: "Claude Sonnet 5" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "openai/gpt-5.6-sol", label: "GPT-5.6 Sol" }
];
var DEFAULT_MODEL = MODELS[0].id;

// api/v1/agent/models.ts
function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("cache-control", "public, s-maxage=300");
  return res.status(200).json({
    configured: Boolean(process.env.OPENROUTER_API_KEY),
    models: MODELS
  });
}
export {
  handler as default
};
//# sourceMappingURL=models.js.map
