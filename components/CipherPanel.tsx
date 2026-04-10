import React from 'react';
import type { CipherKey } from '../lib/gematria-engine';
import s from '../styles/CipherPanel.module.css';
interface Entry { letter: string; value: number; position: number; }
interface Props { cipher: CipherKey; data: { breakdown: Entry[]; total: number }; }
export default function CipherPanel({ data }: Props) {
  return (
    <div style={{overflowX:'auto'}}>
      <table className={s.tbl}>
        <thead className={s.thead}>
          <tr><th>#</th><th>Letter</th><th>Value</th></tr>
        </thead>
        <tbody>
          {data.breakdown.map((e,i)=>(
            <tr key={i} className={s.row}>
              <td className={s.pos}>{e.position}</td>
              <td className={s.ltr}>{e.letter}</td>
              <td className={s.num}>{e.value}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={3} className={s.totalRow}>
            <span className={s.totalLbl}>Total</span>
            <span className={s.totalVal}>{data.total}</span>
          </td></tr>
        </tfoot>
      </table>
    </div>
  );
}
