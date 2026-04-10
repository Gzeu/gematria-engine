import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { CIPHER_DEFS, WORD_LIST } from '@/lib/gematria-engine';
import type { GematriaResponse, CipherKey } from '@/lib/gematria-engine';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import styles from '@/styles/Compare.module.css';

// ─── Radar chart ──────────────────────────────────────────────────────────────
interface RadarProps {
  a: Record<string, number>;
  b: Record<string, number>;
  ciphers: typeof CIPHER_DEFS;
}

function RadarChart({ a, b, ciphers }: RadarProps) {
  const cx = 120, cy = 120, r = 90;
  const n = ciphers.length;
  const max = Math.max(...ciphers.flatMap(c => [a[c.key] ?? 0, b[c.key] ?? 0]), 1);

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, val: number) => {
    const ratio = val / max;
    return { x: cx + r * ratio * Math.cos(angle(i)), y: cy + r * ratio * Math.sin(angle(i)) };
  };
  const axPt = (i: number) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });

  const polyPoints = (vals: number[]) =>
    vals.map((v, i) => { const p = pt(i, v); return `${p.x},${p.y}`; }).join(' ');

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 240 240" width="100%" style={{ maxWidth: 240 }} aria-label="Radar comparison chart">
      {rings.map(ring => (
        <polygon
          key={ring}
          points={ciphers.map((_, i) => {
            const p = axPt(i);
            return `${cx + (p.x - cx) * ring},${cy + (p.y - cy) * ring}`;
          }).join(' ')}
          fill="none" stroke="var(--br)" strokeWidth={0.8}
        />
      ))}
      {ciphers.map((_, i) => {
        const p = axPt(i);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--br)" strokeWidth={0.8} />;
      })}
      <polygon points={polyPoints(ciphers.map(c => a[c.key] ?? 0))} fill="var(--a1)" fillOpacity={0.18} stroke="var(--a1)" strokeWidth={2} strokeLinejoin="round" />
      <polygon points={polyPoints(ciphers.map(c => b[c.key] ?? 0))} fill="var(--a4)" fillOpacity={0.18} stroke="var(--a4)" strokeWidth={2} strokeLinejoin="round" />
      {ciphers.map((c, i) => {
        const p = axPt(i);
        const lx = cx + (p.x - cx) * 1.18;
        const ly = cy + (p.y - cy) * 1.18;
        const label = c.name
          .replace('English Ordinal', 'Eng. Ord.')
          .replace('Eng. Reduction', 'Reduction')
          .replace('Reverse Ordinal', 'Reverse')
          .replace('Hebrew Standard', 'Hebrew');
        return (
          <text key={c.key} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize={7} fill="var(--txm)" fontFamily="var(--fm)">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function fetchGematria(word: string): Promise<GematriaResponse> {
  const res = await fetch('/api/gematria', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: word }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'API error');
  return json as GematriaResponse;
}

function totals(data: GematriaResponse): Record<CipherKey, number> {
  return Object.fromEntries(
    CIPHER_DEFS.map(d => [d.key, data.ciphers[d.key].total])
  ) as Record<CipherKey, number>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Compare() {
  const router = useRouter();

  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [dataA, setDataA] = useState<GematriaResponse | null>(null);
  const [dataB, setDataB] = useState<GematriaResponse | null>(null);
  const [showBreakdown, setShowBreakdown] = useState<CipherKey | null>(null);
  const [copied, setCopied] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from URL on mount
  useEffect(() => {
    if (!router.isReady) return;
    const { wa, wb } = router.query;
    const wA = typeof wa === 'string' ? wa : '';
    const wB = typeof wb === 'string' ? wb : '';
    if (wA) setInputA(wA);
    if (wB) setInputB(wB);
    if (wA && wB) runAnalyze(wA, wB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  function runAnalyze(wA: string, wB: string) {
    const cleanA = wA.trim();
    const cleanB = wB.trim();
    if (!cleanA || !cleanB) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    router.replace(
      { pathname: '/compare', query: { wa: cleanA, wb: cleanB } },
      undefined,
      { shallow: true }
    );

    fetchGematria(cleanA).then(setDataA).catch(() => setDataA(null));
    fetchGematria(cleanB).then(setDataB).catch(() => setDataB(null));
  }

  function scheduleAnalyze(wA: string, wB: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (wA.trim().length >= 2 && wB.trim().length >= 2) {
      debounceRef.current = setTimeout(() => runAnalyze(wA, wB), 600);
    }
  }

  function handleChangeA(v: string) {
    setInputA(v);
    scheduleAnalyze(v, inputB);
  }

  function handleChangeB(v: string) {
    setInputB(v);
    scheduleAnalyze(inputA, v);
  }

  function handleVS() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runAnalyze(inputA, inputB);
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/compare?wa=${encodeURIComponent(inputA.trim())}&wb=${encodeURIComponent(inputB.trim())}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const hasData = dataA !== null && dataB !== null;
  const matchCount = hasData
    ? CIPHER_DEFS.filter(d => dataA!.ciphers[d.key].total === dataB!.ciphers[d.key].total).length
    : 0;

  return (
    <>
      <Head>
        <title>Compare — Gematria Engine</title>
        <meta name="description" content="Compare two words across 6 Gematria ciphers with radar chart, match score, and shareable URL." />
      </Head>

      <div className={styles.page}>

        {/* Header */}
        <header className={styles.hdr}>
          <div className={styles.hdrLeft}>
            <Link href="/"><Logo /></Link>
          </div>
          <div className={styles.hdrRight}>
            {hasData && (
              <button className={styles.shareBtn} onClick={handleCopyLink} title="Copy shareable link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {copied ? 'Copied!' : 'Share'}
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Inputs */}
        <div className={styles.inputs}>
          <div className={styles.inputWrap}>
            <label className={styles.lbl} htmlFor="word-a">Word A</label>
            <input
              id="word-a"
              className={styles.inp}
              list="words-list"
              value={inputA}
              onChange={e => handleChangeA(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVS()}
              placeholder="e.g. George"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <button className={styles.vs} onClick={handleVS} type="button">VS</button>

          <div className={styles.inputWrap}>
            <label className={styles.lbl} htmlFor="word-b">Word B</label>
            <input
              id="word-b"
              className={styles.inp}
              list="words-list"
              value={inputB}
              onChange={e => handleChangeB(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVS()}
              placeholder="e.g. Fire"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <datalist id="words-list">
            {WORD_LIST.slice(0, 80).map(w => <option key={w} value={w} />)}
          </datalist>
        </div>

        {/* Results */}
        {hasData && (
          <div className={styles.resultWrap}>

            {/* Match badge + Radar */}
            <div className={styles.summaryRow}>
              <div className={styles.matchBadge} data-full={String(matchCount === CIPHER_DEFS.length)}>
                <span className={styles.matchNum}>{matchCount}</span>
                <span className={styles.matchOf}>/{CIPHER_DEFS.length}</span>
                <span className={styles.matchLabel}>cipher{matchCount !== 1 ? 's' : ''} match</span>
              </div>

              <div className={styles.radar}>
                <RadarChart a={totals(dataA!)} b={totals(dataB!)} ciphers={CIPHER_DEFS} />
                <div className={styles.radarLegend}>
                  <span style={{ color: 'var(--a1)' }}>■ {dataA!.original_input}</span>
                  <span style={{ color: 'var(--a4)' }}>■ {dataB!.original_input}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span className={styles.thCipher}>Cipher</span>
                <span className={styles.thWord} style={{ color: 'var(--a1)' }}>{dataA!.original_input}</span>
                <span className={styles.thPct}>Sim %</span>
                <span className={styles.thDiff}>Δ</span>
                <span className={styles.thWord} style={{ color: 'var(--a4)' }}>{dataB!.original_input}</span>
              </div>

              {CIPHER_DEFS.map(d => {
                const av = dataA!.ciphers[d.key].total;
                const bv = dataB!.ciphers[d.key].total;
                const diff = av - bv;
                const match = av === bv;
                const maxV = Math.max(av, bv, 1);
                const sim = Math.round((1 - Math.abs(diff) / maxV) * 100);
                const aWins = av > bv;
                const bWins = bv > av;
                const open = showBreakdown === d.key;

                return (
                  <div key={d.key}>
                    <div
                      className={`${styles.tableRow} ${match ? styles.match : ''}`}
                      onClick={() => setShowBreakdown(open ? null : d.key)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setShowBreakdown(open ? null : d.key)}
                      aria-expanded={open}
                    >
                      <div>
                        <div className={styles.cName}>{d.name}</div>
                        <div className={styles.cSub}>{d.sub}</div>
                      </div>

                      <div className={styles.valCol}>
                        <div className={styles.val} style={{ color: 'var(--a1)', fontWeight: aWins ? 800 : 500 }}>{av}</div>
                        <div className={styles.bar}>
                          <div className={styles.barFillA} style={{ width: `${(av / maxV) * 100}%` }} />
                        </div>
                      </div>

                      <div className={styles.simCol}>
                        <span className={styles.simPct} style={{ opacity: sim / 100 * 0.7 + 0.3 }}>{sim}%</span>
                      </div>

                      <div className={styles.diff}
                        style={{ color: match ? 'var(--a3)' : diff > 0 ? 'var(--a1)' : 'var(--a4)' }}>
                        {match ? '=' : diff > 0 ? `+${diff}` : String(diff)}
                      </div>

                      <div className={styles.valCol}>
                        <div className={styles.val} style={{ color: 'var(--a4)', fontWeight: bWins ? 800 : 500 }}>{bv}</div>
                        <div className={styles.bar}>
                          <div className={styles.barFillB} style={{ width: `${(bv / maxV) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Breakdown panel — outside the grid row */}
                    {open && (
                      <div className={styles.breakdown}>
                        <div className={styles.bdSection}>
                          <span style={{ color: 'var(--a1)', fontWeight: 600 }}>{dataA!.original_input}</span>
                          <div className={styles.bdLetters}>
                            {Object.entries(dataA!.ciphers[d.key].breakdown).map(([k, v]) => (
                              <span key={k} className={styles.bdPill}>{k}<em>{v}</em></span>
                            ))}
                          </div>
                          <div className={styles.bdMatches}>
                            Matches: {dataA!.ciphers[d.key].matching_words.filter(w => w !== '—').join(', ') || 'none'}
                          </div>
                        </div>
                        <div className={styles.bdSection}>
                          <span style={{ color: 'var(--a4)', fontWeight: 600 }}>{dataB!.original_input}</span>
                          <div className={styles.bdLetters}>
                            {Object.entries(dataB!.ciphers[d.key].breakdown).map(([k, v]) => (
                              <span key={k} className={styles.bdPill}>{k}<em>{v}</em></span>
                            ))}
                          </div>
                          <div className={styles.bdMatches}>
                            Matches: {dataB!.ciphers[d.key].matching_words.filter(w => w !== '—').join(', ') || 'none'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className={styles.summary}>
                <span>Numerology: <strong style={{ color: 'var(--a1)' }}>{dataA!.base_number}</strong></span>
                <span style={{ color: 'var(--txm)' }}>base numbers</span>
                <span style={{ textAlign: 'right' }}>Numerology: <strong style={{ color: 'var(--a4)' }}>{dataB!.base_number}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasData && (
          <div className={styles.empty}>
            <div className={styles.emptyGlyph}>⇄</div>
            <p>Enter two words above — results appear automatically after 2 characters.</p>
            <p className={styles.emptyHint}>Or press <kbd>VS</kbd> to compare instantly.</p>
          </div>
        )}

      </div>
    </>
  );
}
