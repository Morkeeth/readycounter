import type { ToolProbeResult } from '../lib/stranger-probes';

interface ToolProbePanelProps {
  probes: ToolProbeResult[];
}

export function ToolProbePanel({ probes }: ToolProbePanelProps) {
  if (probes.length === 0) return null;

  return (
    <article className="tool-probes" aria-label="WebMCP tool checks">
      <h3>Tool checks — hand these to your developer</h3>
      <p className="integrations__muted">
        Each row is the exact request that produced the result. PASS / FAIL / NOT MEASURED.
      </p>
      <table className="tool-probes__table">
        <thead>
          <tr>
            <th scope="col">Tool</th>
            <th scope="col">Request</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {probes.map((probe) => (
            <tr
              key={probe.tool}
              className={
                probe.notMeasured
                  ? 'tool-probes__row--na'
                  : probe.pass
                    ? 'tool-probes__row--pass'
                    : 'tool-probes__row--fail'
              }
            >
              <td>
                <code>{probe.tool}</code>
              </td>
              <td className="tool-probes__req">
                <code>{probe.request}</code>
              </td>
              <td>
                <strong>
                  {probe.notMeasured ? 'NOT MEASURED' : probe.pass ? 'PASS' : 'FAIL'}
                </strong>
                <span className="tool-probes__detail">{probe.detail}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
