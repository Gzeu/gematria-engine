import React from 'react';

interface Props {
  word: string;
  cipher: Record<string, number>;
}

const HEBREW_LIKE: Record<string, string> = {
  A:'א',B:'ב',C:'ג',D:'ד',E:'ה',F:'ו',G:'ז',H:'ח',I:'ט',J:'י',
  K:'כ',L:'ל',M:'מ',N:'נ',O:'ס',P:'פ',Q:'צ',R:'ק',S:'ר',T:'ש',
  U:'ת',V:'ך',W:'ם',X:'ן',Y:'ף',Z:'ץ'
};

export default function GlyphMatrix({ word, cipher }: Props) {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, '').split('');
  if (!letters.length) return null;

  const total = letters.reduce((s, l) => s + (cipher[l] ?? 0), 0);

  return (
    <div style={{ marginTop: 'var(--s4)' }}>
      <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--s4)' }}>
        {letters.map((l, i) => (
          <div
            key={i}
            className="anim-fadeUp"
            style={{
              animationDelay: `${i * 40}ms`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--s1)',
              padding: 'var(--s3) var(--s3)',
              borderRadius: 'var(--rm)',
              background: 'var(--sf)',
              border: '1px solid var(--br)',
              minWidth: '52px',
            }}
          >
            <span style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', color: 'var(--pr)', lineHeight: 1 }}>
              {HEBREW_LIKE[l] ?? l}
            </span>
            <span style={{ fontFamily: 'var(--fb)', fontSize: 'var(--tx2)', fontWeight: 700, color: 'var(--tx)', lineHeight: 1 }}>
              {l}
            </span>
            <span style={{ fontFamily: 'var(--fm)', fontSize: 'var(--tx0)', color: 'var(--txm)', lineHeight: 1 }}>
              {cipher[l] ?? 0}
            </span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontFamily: 'var(--fm)', fontSize: 'var(--tx0)', color: 'var(--txm)', marginTop: 'var(--s2)' }}>
        SUM = <span style={{ color: 'var(--pr)', fontWeight: 700, fontSize: 'var(--tx3)' }}>{total}</span>
      </div>
    </div>
  );
}
