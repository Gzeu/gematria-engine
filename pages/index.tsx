import React, { useState, useRef, useCallback } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import CipherSidebar from '../components/CipherSidebar';
import CipherPanel from '../components/CipherPanel';
import NumerologyCard from '../components/NumerologyCard';
import JsonOutput from '../components/JsonOutput';
import LetterGrid from '../components/LetterGrid';
import RadarChart from '../components/RadarChart';
import BarChart from '../components/BarChart';
import SearchHistory from '../components/SearchHistory';
import GlyphMatrix from '../components/GlyphMatrix';
import s from '../styles/Home.module.css';

const CIPHER_COLORS: Record<string, string> = {
  ordinal: 'var(--a1)', pythagorean: 'var(--a2)', reverse: 'var(--a3)',
  sumerian: 'var(--a4)', chaldean: 'var(--a5)', hebrew: 'var(--a6)',
};

const CIPHER_LABELS: Record<string, string> = {
  ordinal: 'Ordinal', pythagorean: 'Pythagorean', reverse: 'Reverse',
  sumerian: 'Sumerian', chaldean: 'Chaldean', hebrew: 'Hebrew',
};

type Tab = 'breakdown' | 'grid' | 'glyph' | 'json';

const HomePage: NextPage = () => {
  const [word, setWord]           = useState('');
  const [result, setResult]       = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [activeCipher, setActiveCipher] = useState('ordinal');
  const [activeTab, setActiveTab] = useState<Tab>('breakdown');
  const [history, setHistory]     = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const analyze = useCallback(async (w?: string) => {
    const q = (w ?? word).trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gematria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: q }),
      });
      const data = await res.json();
      setResult(data);
      setHistory(h => [...new Set([...h.filter(x => x !== q), q])].slice(-12));
    } catch {}
    setLoading(false);
  }, [word]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); analyze(); }
  };

  const cipherData = result?.ciphers?.[activeCipher];
  const letters    = result?.original_input
    ? result.original_input.toUpperCase().replace(/[^A-Z]/g,'').split('')
    : [];

  const radarData = result
    ? Object.entries(result.ciphers ?? {}).map(([k, v]: any) => ({
        label: k.substring(0,3).toUpperCase(),
        value: v.total ?? 0,
        color: CIPHER_COLORS[k] ?? 'var(--pr)',
      }))
    : [];

  const barData = result
    ? Object.entries(result.ciphers ?? {}).map(([k, v]: any) => ({
        label: CIPHER_LABELS[k] ?? k,
        value: v.total ?? 0,
        color: CIPHER_COLORS[k] ?? 'var(--pr)',
      }))
    : [];

  return (
    <>
      <Head>
        <title>Gematria Engine</title>
        <meta name="description" content="Advanced gematria analysis — 6 ciphers, visualizations, numerology" />
      </Head>

      <div className={s.shell}>
        {/* HEADER */}
        <header className={s.header}>
          <Logo />
          <nav className={s.headerNav}>
            <Link href="/" className={`${s.navLink} ${s.navLinkActive}`}>Analyze</Link>
            <Link href="/compare" className={s.navLink}>Compare</Link>
            <ThemeToggle />
          </nav>
        </header>

        <div className={s.body}>
          {/* SIDEBAR */}
          <aside className={s.sidebar}>
            {result && (
              <>
                <CipherSidebar
                  ciphers={result.ciphers}
                  active={activeCipher}
                  onSelect={setActiveCipher}
                />
                <div style={{ marginTop: 'var(--s4)' }}>
                  <NumerologyCard summary={result.numerology_summary} />
                </div>
                {/* Radar */}
                <div className={s.card} style={{ padding: 'var(--s4)' }}>
                  <div className={s.cardTitle}>Cipher Radar</div>
                  <RadarChart ciphers={radarData} size={220} />
                </div>
              </>
            )}
            {!result && (
              <div style={{ padding: 'var(--s4)', color: 'var(--txf)', fontSize: 'var(--tx1)', lineHeight: 1.7, fontFamily: 'var(--fd)', fontStyle: 'italic' }}>
                Enter any word or phrase to decode its gematric signature across 6 ancient cipher systems.
              </div>
            )}
          </aside>

          {/* MAIN */}
          <main className={s.main}>
            {/* INPUT */}
            <div className={s.card}>
              <div className={s.heroWrap}>
                <textarea
                  ref={inputRef}
                  className={s.heroInput}
                  rows={1}
                  value={word}
                  onChange={e => setWord(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a word…"
                  aria-label="Word or phrase to analyze"
                  spellCheck={false}
                  style={{ minHeight: '60px' }}
                />
                <div className={s.heroUnderline} style={{ transform: word ? 'scaleX(1)' : 'scaleX(0)' }} />
              </div>
              <div className={s.heroMeta}>
                <button
                  className={s.analyzeBtn}
                  onClick={() => analyze()}
                  disabled={loading || !word.trim()}
                >
                  {loading ? '…' : '⬡ Analyze'}
                </button>
                {word && (
                  <span className={s.heroCount}>
                    {word.replace(/[^A-Za-z]/g,'').length} letters
                  </span>
                )}
              </div>
              <SearchHistory
                history={history}
                onSelect={w => { setWord(w); analyze(w); }}
                onClear={() => setHistory([])}
              />
            </div>

            {/* RESULTS */}
            {result && (
              <>
                {/* Bar overview */}
                <div className={s.card}>
                  <div className={s.cardTitle}>All Ciphers</div>
                  <BarChart bars={barData} />
                </div>

                {/* Active cipher detail */}
                {cipherData && (
                  <div className={s.card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s4)', flexWrap: 'wrap', gap: 'var(--s3)' }}>
                      <div className={s.cardTitle} style={{ marginBottom: 0 }}>
                        {CIPHER_LABELS[activeCipher] ?? activeCipher}
                      </div>
                      <div className={s.totalBadge}>
                        <span className={s.totalNum}>{cipherData.total}</span>
                        <span className={s.totalLabel}>total</span>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className={s.tabs} style={{ marginBottom: 'var(--s5)' }}>
                      {(['breakdown','grid','glyph','json'] as Tab[]).map(t => (
                        <button
                          key={t}
                          className={`${s.tab} ${activeTab === t ? s.tabActive : ''}`}
                          onClick={() => setActiveTab(t)}
                        >
                          {t === 'breakdown' ? '⊞ Table' : t === 'grid' ? '▦ Grid' : t === 'glyph' ? 'ℵ Glyph' : '{ } JSON'}
                        </button>
                      ))}
                    </div>

                    {activeTab === 'breakdown' && (
                      <CipherPanel cipher={activeCipher} data={cipherData} />
                    )}
                    {activeTab === 'grid' && (
                      <LetterGrid
                        letters={letters}
                        values={cipherData.breakdown}
                        accentVar={`--${['a1','a2','a3','a4','a5','a6'][Object.keys(result.ciphers).indexOf(activeCipher)] ?? 'pr'}`}
                      />
                    )}
                    {activeTab === 'glyph' && (
                      <GlyphMatrix word={result.original_input} cipher={cipherData.breakdown} />
                    )}
                    {activeTab === 'json' && (
                      <JsonOutput data={result} />
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default HomePage;
