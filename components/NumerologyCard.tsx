import React from 'react';
import s from '../styles/NumerologyCard.module.css';
interface Props { summary: Record<string,any>; }
export default function NumerologyCard({ summary }: Props) {
  if (!summary) return null;
  const entries = Object.entries(summary).filter(([,v]) => v !== null && v !== undefined);
  return (
    <div className={s.card}>
      <div className={s.title}>Numerology</div>
      {entries.map(([k,v]) => (
        <div key={k} className={s.row}>
          <span className={s.lbl}>{k.replace(/_/g,' ')}</span>
          <span className={s.val}>{typeof v==='object'?JSON.stringify(v):String(v)}</span>
        </div>
      ))}
    </div>
  );
}
