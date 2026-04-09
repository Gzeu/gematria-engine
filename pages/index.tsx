import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useGematria } from '@/hooks/useGematria';
import { CIPHER_DEFS, CipherKey } from '@/lib/gematria-engine';
import CipherPanel from '@/components/CipherPanel';
import CipherSidebar from '@/components/CipherSidebar';
import NumerologyCard from '@/components/NumerologyCard';
import ThemeToggle from '@/components/ThemeToggle';
import JsonOutput from '@/components/JsonOutput';
import Logo from '@/components/Logo';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const { data, loading, error, analyze } = useGematria();
  const [input, setInput] = useState('');
  const [active, setActive] = useState<CipherKey>('english_ordinal');

  function handleAnalyze() {
    if (input.trim()) analyze(input.trim());
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAnalyze();
  }

  const activeCipher = data?.ciphers[active];
  const activeDef = CIPHER_DEFS.find(d => d.key === active)!;

  return (
    <>
      <Head><title>Gematria Engine</title></Head>
      <div className={styles.app}>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sb}>
          <div className={styles.sbTop}>
            <Logo />
            <ThemeToggle />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.lbl} htmlFor="wi">Word / Phrase</label>
            <input
              id="wi"
              className={styles.inp}
              type="text"
              placeholder="Type anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="off"
              spellCheck={false}
            />
            <button className={styles.abtn} onClick={handleAnalyze} disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>

          {data && (
            <>
              <CipherSidebar
                data={data}
                active={active}
                onSelect={setActive}
              />
              <NumerologyCard
                baseNumber={data.base_number}
                summary={data.numerology_summary}
              />
            </>
          )}

          {error && <p className={styles.err}>{error}</p>}

          <div className={styles.sbFooter}>
            <Link href="/compare" className={styles.cmpLink}>⇄ Compare two words</Link>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className={styles.mn}>
          {!data ? (
            <div className={styles.hero}>
              <div className={styles.heroGlyph}>אΩ</div>
              <h1 className={styles.heroTitle}>Cryptolinguistic Analysis</h1>
              <p className={styles.heroSub}>
                Enter any word, name, or phrase to reveal its numerical signature
                across 6 ancient and modern Gematria ciphers.
              </p>
              <div className={styles.heroCiphers}>
                {CIPHER_DEFS.map(d => (
                  <span key={d.key} className={styles.heroPill} style={{ borderColor: d.color, color: d.color }}>
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.results}>
              <div className={styles.rHeader}>
                <span className={styles.rWord}>{data.original_input}</span>
                <span className={styles.rMeta} style={{ fontFamily: 'var(--fm)' }}>
                  {data.original_input.replace(/[^a-zA-Z]/g, '').length} letters · 6 ciphers
                </span>
              </div>

              {activeCipher && (
                <CipherPanel
                  key={active}
                  def={activeDef}
                  cipher={activeCipher}
                />
              )}

              <div className={styles.allCiphers}>
                <div className={styles.sectionLabel}>All Cipher Totals</div>
                {CIPHER_DEFS.map(d => (
                  <div
                    key={d.key}
                    className={`${styles.cr} ${d.key === active ? styles.crActive : ''}`}
                    onClick={() => setActive(d.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setActive(d.key)}
                  >
                    <div>
                      <div className={styles.crName}>{d.name}</div>
                      <div className={styles.crSub}>{d.sub}</div>
                    </div>
                    <div className={styles.crVal} style={{ color: d.color }}>
                      {data.ciphers[d.key].total}
                    </div>
                  </div>
                ))}
              </div>

              <JsonOutput data={data} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
