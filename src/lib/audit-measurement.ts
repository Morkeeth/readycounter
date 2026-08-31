import { getSource } from '../data/sources';
import type { StoreAuditSignals } from '../types/audit';
import type { AcpPolicyProbe } from '../server/acp-probe';

export interface AuditOfferBlock {
  pct: number;
  completePct: number;
  withOffer: number;
  total: number;
  sourceId: 'schema_offer_gap';
  benchmarkFigure: string;
  benchmarkClaim: string;
  deltaVsBenchmarkPp: number;
}

export function buildAuditOfferBlock(signals: StoreAuditSignals): AuditOfferBlock {
  const benchmark = getSource('schema_offer_gap');
  const benchmarkPct = parseInt(benchmark.figure, 10) || 19;
  return {
    pct: signals.offerCoverage,
    completePct: signals.completeOfferCoverage,
    withOffer: signals.offerWithCount,
    total: signals.offerTotal,
    sourceId: 'schema_offer_gap',
    benchmarkFigure: benchmark.figure,
    benchmarkClaim: benchmark.claim,
    deltaVsBenchmarkPp: signals.offerCoverage - benchmarkPct,
  };
}

export interface AuditMeasurementPayload {
  offer: AuditOfferBlock;
  acpPolicy: AcpPolicyProbe;
}
