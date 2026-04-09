import React from 'react';

interface Props {
  history: string[];
  onSelect: (word: string) => void;
  onClear: () => void;
}

export default function SearchHistory({ history, onSelect, onClear }: Props) {
  if (!history.length) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--s2)', marginTop: 'var(--s3)' }}>
      <span style={{ fontSize: 'var(--tx0)', color: 'var(--txf)', fontFamily: 'var(--fm)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Recent:</span>
      {history.slice().reverse().map((w, i) => (
        <button key={i} className="histPill" onClick={() => onSelect(w)}>
          {w}
        </button>
      ))}
      <button
        onClick={onClear}
        style={{ fontSize: 'var(--tx0)', color: 'var(--txf)', fontFamily: 'var(--fm)', padding: '2px var(--s2)', cursor: 'pointer', transition: 'color var(--tt)' }}
        title="Clear history"
      >
        ✕
      </button>
    </div>
  );
}
