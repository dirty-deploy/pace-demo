import type { ReactNode } from 'react';
import type { Group, StimulusBlock } from '../../content/types';

const PALETTE = ['var(--primary)', 'var(--gold)', 'var(--info)', 'var(--ok)'];

/** Horizontal grouped bars drawn in SVG, with every value printed so nothing relies on colour. */
export function BarsChart({ block }: { block: Extract<StimulusBlock, { type: 'bars' }> }) {
  const rowH = 20;
  const groupGap = 14;
  const left = 96;
  const right = 48;
  const width = 480;
  const max = Math.max(...block.series.flatMap((s) => s.values));
  const groupH = block.series.length * rowH;
  const height = block.categories.length * (groupH + groupGap) + 8;
  return (
    <figure className="stim-chart">
      <figcaption className="small muted">
        {block.caption} ({block.unit})
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${block.caption}, in ${block.unit}`}>
        {block.categories.map((c, ci) => {
          const y0 = ci * (groupH + groupGap) + 4;
          return (
            <g key={c}>
              <text x={left - 8} y={y0 + groupH / 2 + 4} textAnchor="end" fontSize="12" fill="var(--text)">
                {c}
              </text>
              {block.series.map((s, si) => {
                const w = (s.values[ci] / max) * (width - left - right);
                const y = y0 + si * rowH;
                return (
                  <g key={s.name}>
                    <rect x={left} y={y + 2} width={w} height={rowH - 6} rx="2" fill={PALETTE[si % PALETTE.length]} />
                    <text x={left + w + 6} y={y + rowH - 6} fontSize="11" fill="var(--text)">
                      {s.values[ci]}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <ul className="stim-legend">
        {block.series.map((s, i) => (
          <li key={s.name}>
            <i style={{ background: PALETTE[i % PALETTE.length] }} aria-hidden />
            {s.name}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Renders a passage or a DILR stimulus. `renderText` lets review add vocabulary underlines. */
export function GroupBody({
  group,
  renderText = (t) => t,
  clueAction,
}: {
  group: Group;
  renderText?: (text: string) => ReactNode;
  clueAction?: (index: number, text: string) => ReactNode;
}) {
  if (group.kind === 'passage') {
    return (
      <div className="stim-passage">
        <h2 className="section-title">{group.title}</h2>
        {group.paragraphs.map((p, i) => (
          <p key={i}>{renderText(p)}</p>
        ))}
      </div>
    );
  }
  let clue = 0;
  return (
    <div className="stim-set">
      <h2 className="section-title">{group.title}</h2>
      {group.stimulus.map((b, i) => {
        if (b.type === 'text') return <p key={i}>{renderText(b.text)}</p>;
        if (b.type === 'list') {
          return (
            <ol key={i} className="stim-list">
              {b.items.map((item) => {
                const index = clue++;
                return (
                  <li key={item}>
                    <span>{renderText(item)}</span>
                    {clueAction?.(index, item)}
                  </li>
                );
              })}
            </ol>
          );
        }
        if (b.type === 'bars') return <BarsChart key={i} block={b} />;
        return (
          <div key={i} className="table-wrap">
            <table className="table stim-table">
              {b.caption && <caption className="small muted">{b.caption}</caption>}
              <thead>
                <tr>
                  {b.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((cell, ci) => (
                      <td key={ci} className="num">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
