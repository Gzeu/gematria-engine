import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { CIPHER_DEFS, WORD_LIST } from '@/lib/gematria-engine';
import type { GematriaResponse, CipherKey } from '@/lib/gematria-engine';
import ThemeToggle from '@/components/ThemeToggle';
import s from '@/styles/Compare.module.css';

// ── SVG Radar ────────────────────────────────────────────────────────────────
function RadarViz({ dataA, dataB, wordA, wordB, ciphers }: {
  dataA: Record<string,number>; dataB: Record<string,number>;
  wordA: string; wordB: string; ciphers: typeof CIPHER_DEFS;
}) {
  const n = ciphers.length;
  const cx = 150, cy = 150, r = 110;
  const max = Math.max(...ciphers.flatMap(c => [dataA[c.key]??0, dataB[c.key]??0]), 1);
  const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt  = (i: number, val: number) => {
    const s2 = (val / max) * r;
    return `${cx + s2 * Math.cos(ang(i))},${cy + s2 * Math.sin(ang(i))}`;
  };
  const ringPts = (scale: number) =>
    ciphers.map((_, i) => `${cx + r * scale * Math.cos(ang(i))},${cy + r * scale * Math.sin(ang(i))}`).join(' ');
  const polyA = ciphers.map((_, i) => pt(i, dataA[ciphers[i].key] ?? 0)).join(' ');
  const polyB = ciphers.map((_, i) => pt(i, dataB[ciphers[i].key] ?? 0)).join(' ');
  const shortName = (name: string) =>
    name.replace('English Ordinal','Ord').replace('Eng. Reduction','Red')
        .replace('Reverse Ordinal','Rev').replace('Hebrew Standard','Heb')
        .replace('English Sumerian','Sum').replace('Chaldean','Chld');
  return (
    <div className={s.radarWrap}>
      <svg viewBox="0 0 300 300" className={s.radarSvg} aria-hidden>
        <defs>
          <radialGradient id="rgA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c5af5" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#7c5af5" stopOpacity="0.05"/>
          </radialGradient>
          <radialGradient id="rgB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5c0" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#00e5c0" stopOpacity="0.04"/>
          </radialGradient>
        </defs>
        {/* rings */}
        {[0.25, 0.5, 0.75, 1].map(sc => (
          <polygon key={sc} points={ringPts(sc)}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        ))}
        {/* spokes */}
        {ciphers.map((_, i) => (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(ang(i))}
            y2={cy + r * Math.sin(ang(i))}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
        {/* word B polygon */}
        <polygon points={polyB} fill="url(#rgB)" stroke="#00e5c0" strokeWidth="2" strokeOpacity="0.8"/>
        {/* word A polygon */}
        <polygon points={polyA} fill="url(#rgA)" stroke="#7c5af5" strokeWidth="2" strokeOpacity="0.85"/>
        {/* dots */}
        {ciphers.map((c, i) => {
          const [ax, ay] = pt(i, dataA[c.key]??0).split(',').map(Number);
          const [bx, by] = pt(i, dataB[c.key]??0).split(',').map(Number);
          return (
            <g key={c.key}>
              <circle cx={ax} cy={ay} r={3.5} fill="#7c5af5"/>
              <circle cx={bx} cy={by} r={3.5} fill="#00e5c0"/>
            </g>
          );
        })}
        {/* labels */}
        {ciphers.map((c, i) => {
          const lx = cx + (r + 18) * Math.cos(ang(i));
          const ly = cy + (r + 18) * Math.sin(ang(i));
          return (
            <text key={c.key} x={lx} y={ly}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fontFamily="var(--fm)" fill="rgba(255,255,255,0.45)"
              style={{letterSpacing:'0.05em', textTransform:'uppercase'}}>
              {shortName(c.name)}
            </text>
          );
        })}
      </svg>
      <div className={s.radarLegend}>
        <div className={s.radarLi}>
          <span className={s.radarDot} style={{background:'#7c5af5', boxShadow:'0 0 6px rgba(124,90,245,0.7)'}}/>
          <span style={{color:'#c4b5fd', fontWeight:600}}>{wordA}</span>
        </div>
        <div className={s.radarLi}>
          <span className={s.radarDot} style={{background:'#00e5c0', boxShadow:'0 0 6px rgba(0,229,192,0.7)'}}/>
          <span style={{color:'#00e5c0', fontWeight:600}}>{wordB}</span>
        </div>
      </div>
    </div>
  );
}

// ── Bar Viz ──────────────────────────────────────────────────────────────────
function BarsViz({ dataA, dataB, wordA, wordB, ciphers }: {
  dataA: Record<string,number>; dataB: Record<string,number>;
  wordA: string; wordB: string; ciphers: typeof CIPHER_DEFS;
}) {
  const max = Math.max(...ciphers.flatMap(c => [dataA[c.key]??0, dataB[c.key]??0]), 1);
  const short = (n: string) => n.replace('English Ordinal','Ord.').replace('Eng. Reduction','Reduct.')
    .replace('Reverse Ordinal','Rev.').replace('Hebrew Standard','Hebrew').replace('English ','').replace(' Sumerian',' Sum.');
  return (
    <div className={s.barsWrap}>
      <div className={s.barsLegend}>
        <span className={s.barsLegDot} style={{background:'#7c5af5'}}/><span style={{color:'#c4b5fd'}}>{wordA}</span>
        <span className={s.barsLegDot} style={{background:'#00e5c0', marginLeft:'var(--s5)'}}/><span style={{color:'#00e5c0'}}>{wordB}</span>
      </div>
      <div className={s.barsList}>
        {ciphers.map(c => {
          const av = dataA[c.key]??0;
          const bv = dataB[c.key]??0;
          return (
            <div key={c.key} className={s.barsItem}>
              <div className={s.barsName}>{short(c.name)}</div>
              <div className={s.barsTrack}>
                <div className={s.barsFillA} style={{width:`${(av/max)*100}%`}}>
                  <span className={s.barsValA}>{av}</span>
                </div>
              </div>
              <div className={s.barsTrack}>
                <div className={s.barsFillB} style={{width:`${(bv/max)*100}%`}}>
                  <span className={s.barsValB}>{bv}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Dots Viz ─────────────────────────────────────────────────────────────────
function DotsViz({ dataA, dataB, wordA, wordB, ciphers }: {
  dataA: Record<string,number>; dataB: Record<string,number>;
  wordA: string; wordB: string; ciphers: typeof CIPHER_DEFS;
}) {
  const MAX_DOTS = 64;
  return (
    <div className={s.dotsWrap}>
      {ciphers.map(c => {
        const av = Math.min(dataA[c.key]??0, MAX_DOTS);
        const bv = Math.min(dataB[c.key]??0, MAX_DOTS);
        return (
          <div key={c.key} className={s.dotsRow}>
            <div className={s.dotsLabel}>{c.name.replace('English ','').replace(' Standard',' Std.')}</div>
            <div className={s.dotsCols}>
              <div className={s.dotsSide}>
                <div className={s.dotsWord} style={{color:'#c4b5fd'}}>{wordA} <em className={s.dotsNum}>{dataA[c.key]}</em></div>
                <div className={s.dotGrid}>
                  {Array.from({length:MAX_DOTS}).map((_,i) => (
                    <div key={i} className={s.dot}
                      style={{background: i < av ? '#7c5af5' : 'rgba(255,255,255,0.06)'}}/>
                  ))}
                </div>
              </div>
              <div className={s.dotsSide}>
                <div className={s.dotsWord} style={{color:'#00e5c0'}}>{wordB} <em className={s.dotsNum}>{dataB[c.key]}</em></div>
                <div className={s.dotGrid}>
                  {Array.from({length:MAX_DOTS}).map((_,i) => (
                    <div key={i} className={s.dot}
                      style={{background: i < bv ? '#00e5c0' : 'rgba(255,255,255,0.06)'}}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function overallSim(a: GematriaResponse, b: GematriaResponse): number {
  const scores = CIPHER_DEFS.map(d => {
    const av = a.ciphers[d.key].total;
    const bv = b.ciphers[d.key].total;
    const mx = Math.max(av, bv, 1);
    return (1 - Math.abs(av - bv) / mx) * 100;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Compare() {
  const router = useRouter();
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [dataA, setDataA] = useState<GematriaResponse | null>(null);
  const [dataB, setDataB] = useState<GematriaResponse | null>(null);
  const [openBreakdown, setOpenBreakdown] = useState<CipherKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeViz, setActiveViz] = useState<'radar'|'bars'|'dots'>('radar');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAnalyze = useCallback((wA: string, wB: string) => {
    const cA = wA.trim(), cB = wB.trim();
    if (!cA || !cB) return;
    router.replace({ pathname: '/compare', query: { wa: cA, wb: cB } }, undefined, { shallow: true });
    setLoading(true);
    Promise.all([fetchGematria(cA), fetchGematria(cB)])
      .then(([a, b]) => { setDataA(a); setDataB(b); })
      .catch(() => { setDataA(null); setDataB(null); })
      .finally(() => setLoading(false));
  }, [router]);

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

  function scheduleAnalyze(wA: string, wB: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (wA.trim().length >= 2 && wB.trim().length >= 2)
      debounceRef.current = setTimeout(() => runAnalyze(wA, wB), 550);
  }

  function handleA(v: string) { setInputA(v); scheduleAnalyze(v, inputB); }
  function handleB(v: string) { setInputB(v); scheduleAnalyze(inputA, v); }
  function handleVS() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runAnalyze(inputA, inputB);
  }

  function handleCopy() {
    const url = `${window.location.origin}/compare?wa=${encodeURIComponent(inputA.trim())}&wb=${encodeURIComponent(inputB.trim())}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const hasData = dataA !== null && dataB !== null;
  const matchCount = hasData ? CIPHER_DEFS.filter(d => dataA!.ciphers[d.key].total === dataB!.ciphers[d.key].total).length : 0;
  const simScore = hasData ? overallSim(dataA!, dataB!) : 0;
  const simGlow = simScore >= 80 ? '#00e5c0' : simScore >= 50 ? '#ffaa00' : '#f53a8c';

  const VIZ_TABS = [
    { id: 'radar' as const, label: 'Radar', icon: '⬡' },
    { id: 'bars'  as const, label: 'Bars',  icon: '▊' },
    { id: 'dots'  as const, label: 'Dots',  icon: '⠿' },
  ];

  return (
    <>
      <Head>
        <title>Compare — Gematria Engine</title>
        <meta name="description" content="Compare two words across 6 Gematria ciphers with radar, bar, and dot visualizations."/>
      </Head>

      <div className={s.shell}>

        {/* ── NAV ─────────────────────────────────────────── */}
        <header className={s.nav}>
          <div className={s.navLeft}>
            <Link href="/" className={s.logo}>
              <span className={s.logoMark}>ℵ</span>
              <span className={s.logoText}>Gematria</span>
            </Link>
            <div className={s.navLinks}>
              <Link href="/" className={s.navLink}>Analyze</Link>
              <Link href="/compare" className={`${s.navLink} ${s.navActive}`}>Compare</Link>
            </div>
          </div>
          <div className={s.navRight}>
            {hasData && (
              <button className={s.shareBtn} onClick={handleCopy} aria-label="Copy shareable link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                {copied ? 'Copied!' : 'Share'}
              </button>
            )}
            <ThemeToggle/>
          </div>
        </header>

        <main className={s.main}>

          {/* ── HERO INPUTS ─────────────────────────────────── */}
          <section className={s.hero}>
            <div className={s.inputCard} data-accent="a">
              <div className={s.inputLabel}>
                <span className={s.inputPip} style={{background:'#7c5af5'}}/>
                Word A
              </div>
              <input
                id="word-a" className={s.wordInput} list="word-suggestions"
                value={inputA} onChange={e => handleA(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVS()}
                placeholder="e.g. Fire" spellCheck={false} autoComplete="off"
                aria-label="First word for comparison"
              />
              {inputA && (
                <div className={s.inputChars}>
                  {inputA.toUpperCase().replace(/[^A-Z]/g,'').split('').map((ch, i) => (
                    <span key={i} className={s.inputChar}>{ch}</span>
                  ))}
                </div>
              )}
            </div>

            <div className={s.vsCol}>
              <button className={s.vsBtn} onClick={handleVS} type="button" disabled={loading || !inputA.trim() || !inputB.trim()} aria-label="Compare">
                {loading
                  ? <span className="dots"><span/><span/><span/></span>
                  : <span className={s.vsText}>VS</span>
                }
              </button>
              {hasData && (
                <div className={s.vsMatch} data-full={String(matchCount === CIPHER_DEFS.length)}>
                  {matchCount}/{CIPHER_DEFS.length}
                </div>
              )}
            </div>

            <div className={s.inputCard} data-accent="b">
              <div className={s.inputLabel}>
                <span className={s.inputPip} style={{background:'#00e5c0'}}/>
                Word B
              </div>
              <input
                id="word-b" className={s.wordInput} list="word-suggestions"
                value={inputB} onChange={e => handleB(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVS()}
                placeholder="e.g. Water" spellCheck={false} autoComplete="off"
                aria-label="Second word for comparison"
              />
              {inputB && (
                <div className={s.inputChars}>
                  {inputB.toUpperCase().replace(/[^A-Z]/g,'').split('').map((ch, i) => (
                    <span key={i} className={s.inputChar}>{ch}</span>
                  ))}
                </div>
              )}
            </div>

            <datalist id="word-suggestions">
              {WORD_LIST.slice(0, 80).map(w => <option key={w} value={w}/>)}
            </datalist>
          </section>

          {/* ── RESULTS ─────────────────────────────────────── */}
          {hasData && (
            <div className={s.results}>

              {/* BENTO ROW */}
              <div className={s.bento}>

                {/* Match card */}
                <div className={s.bentoCard} data-match={String(matchCount === CIPHER_DEFS.length)}>
                  <div className={s.bentoMatchNum}>{matchCount}</div>
                  <div className={s.bentoMatchDenom}>of {CIPHER_DEFS.length} ciphers</div>
                  <div className={s.bentoMatchLabel}>match{matchCount !== 1 ? 'es' : ''}</div>
                  {matchCount === CIPHER_DEFS.length && (
                    <div className={s.bentoMatchFull}>✦ PERFECT MATCH ✦</div>
                  )}
                </div>

                {/* Similarity gauge */}
                <div className={s.bentoSim} style={{'--glow': simGlow} as React.CSSProperties}>
                  <svg viewBox="0 0 120 70" className={s.gaugesvg} aria-hidden>
                    <path d="M 15 65 A 55 55 0 0 1 105 65" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round"/>
                    <path d="M 15 65 A 55 55 0 0 1 105 65" fill="none" stroke={simGlow}
                      strokeWidth="10" strokeLinecap="round" strokeOpacity="0.85"
                      strokeDasharray={`${(simScore / 100) * 172.8} 172.8`}
                      style={{filter:`drop-shadow(0 0 6px ${simGlow}99)`}}
                    />
                    <text x="60" y="60" textAnchor="middle" fontSize="22" fontWeight="700"
                      fontFamily="var(--fm)" fill="var(--ct)">{simScore}%</text>
                  </svg>
                  <div className={s.simLabel}>similarity</div>
                </div>

                {/* Numerology row */}
                <div className={s.bentoNum}>
                  <div className={s.bentoNumRow}>
                    <span className={s.bentoNumLabel} style={{color:'#c4b5fd'}}>{dataA!.original_input}</span>
                    <span className={s.bentoNumVal} style={{color:'#c4b5fd'}}>{dataA!.base_number}</span>
                  </div>
                  <div className={s.bentoNumDivider}/>
                  <div className={s.bentoNumRow}>
                    <span className={s.bentoNumLabel} style={{color:'#00e5c0'}}>{dataB!.original_input}</span>
                    <span className={s.bentoNumVal} style={{color:'#00e5c0'}}>{dataB!.base_number}</span>
                  </div>
                  <div className={s.bentoNumTitle}>Numerology</div>
                </div>

                {/* Viz tabs */}
                <div className={s.bentoViz}>
                  <div className={s.vizTabsLabel}>Visualization</div>
                  <div className={s.vizTabs}>
                    {VIZ_TABS.map(t => (
                      <button key={t.id}
                        className={`${s.vizTab} ${activeViz === t.id ? s.vizTabActive : ''}`}
                        onClick={() => setActiveViz(t.id)}>
                        <span className={s.vizTabIcon}>{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* VIZ PANEL */}
              <div className={s.vizPanel}>
                {activeViz === 'radar' && (
                  <RadarViz dataA={totals(dataA!)} dataB={totals(dataB!)} wordA={dataA!.original_input} wordB={dataB!.original_input} ciphers={CIPHER_DEFS}/>
                )}
                {activeViz === 'bars' && (
                  <BarsViz dataA={totals(dataA!)} dataB={totals(dataB!)} wordA={dataA!.original_input} wordB={dataB!.original_input} ciphers={CIPHER_DEFS}/>
                )}
                {activeViz === 'dots' && (
                  <DotsViz dataA={totals(dataA!)} dataB={totals(dataB!)} wordA={dataA!.original_input} wordB={dataB!.original_input} ciphers={CIPHER_DEFS}/>
                )}
              </div>

              {/* TABLE */}
              <div className={s.table}>
                <div className={s.tableHead}>
                  <span className={s.thCipher}>Cipher</span>
                  <span className={s.thVal} style={{color:'#c4b5fd'}}>{dataA!.original_input}</span>
                  <span className={s.thSim}>Sim%</span>
                  <span className={s.thDelta}>Δ</span>
                  <span className={s.thVal} style={{color:'#00e5c0'}}>{dataB!.original_input}</span>
                </div>

                {CIPHER_DEFS.map(d => {
                  const av = dataA!.ciphers[d.key].total;
                  const bv = dataB!.ciphers[d.key].total;
                  const diff = av - bv;
                  const isMatch = av === bv;
                  const maxV = Math.max(av, bv, 1);
                  const sim = Math.round((1 - Math.abs(diff) / maxV) * 100);
                  const aWins = av > bv;
                  const bWins = bv > av;
                  const open = openBreakdown === d.key;

                  return (
                    <div key={d.key} className={s.tableGroup}>
                      <div
                        className={`${s.tableRow} ${isMatch ? s.tableRowMatch : ''}`}
                        onClick={() => setOpenBreakdown(open ? null : d.key)}
                        role="button" tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setOpenBreakdown(open ? null : d.key)}
                        aria-expanded={open}
                      >
                        <div className={s.cipherInfo}>
                          <div className={s.cipherName}>{d.name}</div>
                          <div className={s.cipherSub}>{d.sub}</div>
                        </div>

                        <div className={s.valGroup}>
                          <span className={`${s.valNum} ${aWins ? s.valWinner : ''}`} style={{color:'#c4b5fd'}}>{av}</span>
                          <div className={s.miniBar}>
                            <div className={s.miniBarFillA} style={{width:`${(av/maxV)*100}%`}}/>
                          </div>
                        </div>

                        <div className={s.simBadge}>
                          <span className={s.simPct} style={{color: sim===100?'#00e5c0':sim>=70?'#ffaa00':'#9490b8'}}>
                            {sim}%
                          </span>
                        </div>

                        <div className={s.deltaBadge} style={{
                          color: isMatch ? '#00e5c0' : diff > 0 ? '#c4b5fd' : '#00e5c0'
                        }}>
                          {isMatch ? '=' : diff > 0 ? `+${diff}` : String(diff)}
                        </div>

                        <div className={s.valGroup} style={{alignItems:'flex-end'}}>
                          <span className={`${s.valNum} ${bWins ? s.valWinner : ''}`} style={{color:'#00e5c0'}}>{bv}</span>
                          <div className={s.miniBar}>
                            <div className={s.miniBarFillB} style={{width:`${(bv/maxV)*100}%`}}/>
                          </div>
                        </div>

                        <div className={s.expandIcon} aria-hidden>{open ? '▲' : '▼'}</div>
                      </div>

                      {open && (
                        <div className={s.breakdown}>
                          <div className={s.bdCol}>
                            <div className={s.bdTitle} style={{color:'#c4b5fd'}}>
                              {dataA!.original_input}
                              <span className={s.bdTotal}>{av}</span>
                            </div>
                            <div className={s.bdPills}>
                              {Object.entries(dataA!.ciphers[d.key].breakdown).map(([k, v]) => (
                                <span key={k} className={s.bdPill}>
                                  <span className={s.bdLetter}>{k}</span>
                                  <span className={s.bdValue}>{v}</span>
                                </span>
                              ))}
                            </div>
                            {dataA!.ciphers[d.key].matching_words.filter(w => w !== '—').length > 0 && (
                              <div className={s.bdMatches}>
                                <span className={s.bdMatchLabel}>↔ matches:</span>{' '}
                                {dataA!.ciphers[d.key].matching_words.filter(w => w !== '—').join(', ')}
                              </div>
                            )}
                          </div>
                          <div className={s.bdDivider}/>
                          <div className={s.bdCol}>
                            <div className={s.bdTitle} style={{color:'#00e5c0'}}>
                              {dataB!.original_input}
                              <span className={s.bdTotal}>{bv}</span>
                            </div>
                            <div className={s.bdPills}>
                              {Object.entries(dataB!.ciphers[d.key].breakdown).map(([k, v]) => (
                                <span key={k} className={s.bdPill}>
                                  <span className={s.bdLetter}>{k}</span>
                                  <span className={s.bdValue}>{v}</span>
                                </span>
                              ))}
                            </div>
                            {dataB!.ciphers[d.key].matching_words.filter(w => w !== '—').length > 0 && (
                              <div className={s.bdMatches}>
                                <span className={s.bdMatchLabel}>↔ matches:</span>{' '}
                                {dataB!.ciphers[d.key].matching_words.filter(w => w !== '—').join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── EMPTY STATE ─────────────────────────────────── */}
          {!hasData && !loading && (
            <div className={s.empty}>
              <div className={s.emptyOrb}/>
              <div className={s.emptyGlyph}>⊕</div>
              <div className={s.emptyTitle}>Compare Two Words</div>
              <p className={s.emptyText}>Enter any two words to reveal their gematric relationship across all 6 cipher systems.</p>
              <div className={s.emptyHints}>
                <span className={s.emptyHint}>Try: <button className={s.emptyLink} onClick={() => { setInputA('fire'); setInputB('water'); scheduleAnalyze('fire','water'); }}>fire vs water</button></span>
                <span className={s.emptyHint}>or <button className={s.emptyLink} onClick={() => { setInputA('sun'); setInputB('god'); scheduleAnalyze('sun','god'); }}>sun vs god</button></span>
              </div>
            </div>
          )}

          {loading && !hasData && (
            <div className={s.loadingState}>
              <span className="dots"><span/><span/><span/></span>
              <span className={s.loadingText}>Decoding…</span>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
