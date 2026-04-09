import React from 'react';

interface Props {
  letters: string[];
  values: Record<string, number>;
  accentVar?: string;
}

export default function LetterGrid({ letters, values, accentVar = '--pr' }: Props) {
  if (!letters.length) return null;

  const max = Math.max(...Object.values(values), 1);

  // De-duplicate: G G → G1 G2
  const count: Record<string, number> = {};
  const keys = letters.map(l => {
    count[l] = (count[l] || 0) + 1;
    const total = letters.filter(x => x === l).length;
    return total > 1 ? `${l}${count[l]}` : l;
  });

  return (
    <div className="vizGrid" style={{ padding: '0' }}>
      {keys.map((k, i) => {
        const letter = letters[i];
        const val = values[letter] ?? 0;
        const pct = max > 0 ? (val / max) * 100 : 0;
        return (
          <div
            key={`${k}-${i}`}
            className="vizCell anim-fadeUp"
            style={{ animationDelay: `${i * 30}ms` }}
            title={`${letter} = ${val}`}
          >
            <span className="letter">{letter}</span>
            <span className="val">{val}</span>
            <span
              className="bar"
              style={{
                width: `${pct}%`,
                background: `var(${accentVar})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
