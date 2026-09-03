/**
 * Every advertised tool must advertise its parameters.
 *
 * We shipped a manifest with no inputSchema at all. /api/v1/tools listed 18
 * tools that a REST client could not call, and the agent runner handed models
 * an empty schema — two of five frontier models failed the shopping task
 * because we had told them add_to_order took no arguments.
 */
import { readFileSync } from 'node:fs';

const reg = readFileSync('src/webmcp/registerTools.ts', 'utf8');
const schemas = readFileSync('src/webmcp/toolSchemas.ts', 'utf8');
const manifest = readFileSync('src/webmcp/toolManifest.ts', 'utf8');

const names = [...reg.matchAll(/name: '([a-z_]+)',\s*\n\s*description:/g)].map((m) => m[1]);
let bad = 0;

if (names.length !== 18) {
  console.error(`FAIL  registerTools declares ${names.length} tools, expected 18`);
  bad++;
}

for (const n of names) {
  if (!new RegExp(`\\b${n}:\\s*\\{`).test(schemas)) {
    console.error(`FAIL  ${n} has no schema in toolSchemas.ts`);
    bad++;
  }
}

// Tools that take a required argument must say so, or a model cannot call them.
const required = ['get_product', 'add_to_order', 'update_line_quantity', 'remove_line'];
for (const n of required) {
  const block = schemas.split(new RegExp(`\\b${n}:\\s*`))[1] ?? '';
  if (!/required:\s*\[/.test(block.slice(0, 600))) {
    console.error(`FAIL  ${n} declares no required parameters`);
    bad++;
  }
}

if (!manifest.includes('TOOL_MANIFEST_WITH_SCHEMAS')) {
  console.error('FAIL  the manifest does not export schemas for clients');
  bad++;
}

if (bad) {
  console.error(`\nverify-tool-schemas: ${bad} problem(s)`);
  process.exit(1);
}
console.log(`ok   all ${names.length} tools advertise their parameters`);
console.log('verify-tool-schemas: all checks pass');
