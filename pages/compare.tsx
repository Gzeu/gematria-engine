import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { CIPHER_DEFS } from '@/lib/gematria-engine';
import { useGematria } from '@/hooks/useGematria';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import styles from '@/styles/Compare.module.css';

export default function Compare() {
  const a = useGematria();
  const b = useGematria();
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');

  function handleAnalyze() {
    if (inputA.trim()) a.analyze(inputA.trim());
    if (inputB.trim()) b.analyze(inputB.trim());
  }

  const hasData = a.data && b.data;

  return (
    <>
      <Head><title>Compare — Gematria Engine</title></Head>
      <div className={styles.page}>

        <header className={styles.hdr}>
          <div className={styles.hdrLeft}>
            <Link href="/"><Logo /></Link>
          </div>
          <div className={styles.hdrRight}>
            <ThemeToggle />
          </div>
        </header>

        <div className={styles.inputs}>
          <div className={styles.inputWrap}>
            <label className={styles.lbl}>Word A</label>
            <input
              className={styles.inp}
              value={inputA}
              onChange={e => setInputA(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. George"
              spellCheck={false}
            />
          </div>
          <button className={styles.vs} onClick={handleAnalyze}>VS</button>
          <div className={styles.inputWrap}>
            <label className={styles.lbl}>Word B</label>
            <input
              className={styles.inp}
              value={inputB}
              onChange={e => setInputB(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. Fire"
              spellCheck={false}
            />
          </div>
        </div>

        {hasData && (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span className={styles.thCipher}>Cipher</span>
              <span className={styles.thWord} style={{ color: 'var(--a1)' }}>{a.data!.original_input}</span>
              <span className={styles.thDiff}>Δ</span>
              <span className={styles.thWord} style={{ color: 'var(--a4)' }}>{b.data!.original_input}</span>
            </div>
            {CIPHER_DEFS.map(d => {
              const av = a.data!.ciphers[d.key].total;
              const bv = b.data!.ciphers[d.key].total;
              const diff = av - bv;
              const match = av === bv;
              return (
                <div key={d.key} className={`${styles.tableRow} ${match ? styles.match : ''}`}>
                  <div>
                    <div className={styles.cName}>{d.name}</div>
                    <div className={styles.cSub}>{d.sub}</div>
                  </div>
                  <div className={styles.val} style={{ color: 'var(--a1)' }}>{av}</div>
                  <div className={styles.diff} style={{ color: match ? 'var(--a3)' : diff > 0 ? 'var(--a2)' : 'var(--a4)' }}>
                    {match ? '=' : diff > 0 ? `+${diff}` : diff}
                  </div>
                  <div className={styles.val} style={{ color: 'var(--a4)' }}>{bv}</div>
                </div>
              );
            })}
            <div className={styles.summary}>
              <span>Numerology: <strong style={{ color: 'var(--a1)' }}>{a.data!.base_number}</strong></span>
              <span style={{ color: 'var(--txm)' }}>base numbers</span>
              <span>Numerology: <strong style={{ color: 'var(--a4)' }}>{b.data!.base_number}</strong></span>
            </div>
          </div>
        )}

        {!hasData && (
          <div className={styles.empty}>
            <div className={styles.emptyGlyph}>⇄</div>
            <p>Enter two words above and press VS to compare their cipher values side by side.</p>
          </div>
        )}
      </div>
    </>
  );
}
