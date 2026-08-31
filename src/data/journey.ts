export type JourneyStep = 'connect' | 'bill' | 'preview' | 'prove';

export interface JourneyStepDef {
  id: JourneyStep;
  label: string;
  verb: string;
  detail: string;
  tab: 'integrations' | 'merchant' | 'shop';
}

export const MERCHANT_JOURNEY: JourneyStepDef[] = [
  {
    id: 'connect',
    label: 'Connect',
    verb: 'Bring your catalog',
    detail: 'Paste a storefront URL, OAuth Shopify, or try the demo stores.',
    tab: 'integrations',
  },
  {
    id: 'bill',
    label: 'Bill',
    verb: 'Read the tape',
    detail: 'Six lines priced from Presenc AI — every point cites a source row.',
    tab: 'merchant',
  },
  {
    id: 'preview',
    label: 'Preview',
    verb: 'Try a sandbox fix',
    detail: 'Autopilot shows what changes the score — your live checkout stays untouched.',
    tab: 'merchant',
  },
  {
    id: 'prove',
    label: 'Prove',
    verb: 'Co-shop the path',
    detail: 'Human + assistant share one order. WebMCP in-tab, or test tools under Connect.',
    tab: 'shop',
  },
];

export function stepIndex(step: JourneyStep): number {
  return MERCHANT_JOURNEY.findIndex((s) => s.id === step);
}

export function tabForStep(step: JourneyStep): JourneyStepDef['tab'] {
  return MERCHANT_JOURNEY.find((s) => s.id === step)?.tab ?? 'integrations';
}
