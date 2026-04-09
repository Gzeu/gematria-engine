import React from 'react';

interface Bar {
  label: string;
  value: number;
  color: string;
}

interface Props {
  bars: Bar[];
  maxValue?: number;
}

export default function BarChart({ bars, maxValue }: Props) {
  const max = maxValue ?? Math.max(...bars.map(b => b.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 48px', alignItems: 'center', gap: 'var(--s3)' }}>
          <span style={{ fontSize: 'var(--tx0)', fontFamily: 'var(--fm)', color: 'var(--txm)', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {b.label}
          </span>
          <div style={{ height: '8px', borderRadius: 'var(--rf)', background: 'var(--sfd)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(b.value / max) * 100}%`,
                background: b.color,
                borderRadius: 'var(--rf)',
                transition: 'width .7s cubic-bezier(.16,1,.3,1)',
                animationDelay: `${i * 60}ms`,
              }}
            />
          </div>
          <span style={{ fontSize: 'var(--tx0)', fontFamily: 'var(--fm)', color: 'var(--txm)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {b.value}
          </span>
        </div>
      ))}
    </div>
  );
}
