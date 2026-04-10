import React from 'react';
import type { CipherKey, GematriaResponse } from '../lib/gematria-engine';
import { CIPHER_DEFS } from '../lib/gematria-engine';
import s from '../styles/CipherSidebar.module.css';

interface Props { data: GematriaResponse; active: CipherKey; onSelect: (k: CipherKey) => void; }

export default function CipherSidebar({ data, active, onSelect }: Props) {
  return (
    <div className={s.wrap}>
      <div className={s.sectionLabel}>Ciphers</div>
      {CIPHER_DEFS.map((d,i) => (
        <button
          key={d.key}
          className={`${s.item} ${active===d.key?s.active:''}`}
          onClick={()=>onSelect(d.key)}
          style={{'--accent':d.color} as React.CSSProperties}
        >
          <span className={s.dot} style={{background:d.color,boxShadow:`0 0 6px ${d.color}`}} />
          <span className={s.name}>{d.name}</span>
          <span className={s.val}>{data.ciphers[d.key].total}</span>
        </button>
      ))}
    </div>
  );
}
