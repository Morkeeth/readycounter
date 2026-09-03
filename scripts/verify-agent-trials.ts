import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { summarizeCalls, validateToolResultIds } from '../api/v1/agent/step';

const calls = [
  { callId: 'a', name: 'search_catalog', arguments: '{}', result: '{"ok":true}' },
  { callId: 'b', name: 'get_product', arguments: '{}', result: '{"ok":true}' },
  { callId: 'c', name: 'add_to_order', arguments: '{}', result: '{"ok":true}' },
  {
    callId: 'd',
    name: 'prepare_checkout',
    arguments: '{}',
    result: '{"ok":false,"blocked":true,"reason":"CAPTCHA requires a person"}',
  },
];

const summary = summarizeCalls(calls);
assert.deepEqual(summary, {
  callCount: 4,
  searched: true,
  productRead: true,
  cartChanged: true,
  checkoutReached: true,
  blocked: true,
  blocker: 'CAPTCHA requires a person',
});

const pending = [{ id: 'a' }, { id: 'b' }];
assert.equal(validateToolResultIds(pending, [{ callId: 'a' }, { callId: 'b' }]), null);
assert.equal(validateToolResultIds(pending, [{ callId: 'a' }]), 'tool_result_count_mismatch');
assert.equal(
  validateToolResultIds(pending, [{ callId: 'a' }, { callId: 'a' }]),
  'duplicate_tool_result',
);
assert.equal(
  validateToolResultIds(pending, [{ callId: 'a' }, { callId: 'x' }]),
  'unknown_tool_call_id',
);

const source = readFileSync(new URL('../api/v1/agent/step.ts', import.meta.url), 'utf8');
assert.match(source, /api\.openai\.com\/v1\/responses/);
assert.match(source, /previous_response_id/);
assert.doesNotMatch(source, /body\.history/);
assert.doesNotMatch(source, /body\.model/);

console.log('ok   agent receipts summarize observed calls and blockers');
console.log('ok   server rejects missing, duplicate, and unknown tool results');
console.log('ok   direct Responses API owns the transcript and model choice');
console.log('verify-agent-trials: all checks pass');
