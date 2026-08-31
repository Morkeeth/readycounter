/** Classify crawl batch errors for rankings filters (R6 taxonomy). */

export type CrawlOutcome = 'crawled' | 'no-feed' | '403' | '429' | '400' | 'timeout' | 'other';

export const CRAWL_OUTCOME_ORDER: CrawlOutcome[] = [
  'crawled',
  'no-feed',
  '403',
  'timeout',
  '429',
  '400',
  'other',
];

export const CRAWL_OUTCOME_LABEL: Record<CrawlOutcome, string> = {
  crawled: 'crawled',
  'no-feed': 'no-feed',
  '403': '403',
  '429': '429',
  '400': '400',
  timeout: 'timeout',
  other: 'other',
};

export function crawlOutcome(error?: string | null): CrawlOutcome {
  if (!error) return 'crawled';
  const e = error;
  if (e.includes('403')) return '403';
  if (e.includes('429')) return '429';
  if (e.includes('400')) return '400';
  if (/timeout/i.test(e)) return 'timeout';
  if (e.includes('No products') || e.includes('JSON-LD')) return 'no-feed';
  return 'other';
}
