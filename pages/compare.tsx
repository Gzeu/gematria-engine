import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { CIPHER_DEFS, WORD_LIST } from '@/lib/gematria-engine';
import type { GematriaResponse, CipherKey } from '@/lib/gematria-engine';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import styles from '@/styles/Compare.module.css';

// ─── CSS-only Bar Chart ────────────────────────────────────────────────────────
function CssBarChart({ dataA, dataB, wordA, wordB, ciphers }: {
  dataA: Record<string,number>; dataB: Record<string,number>;
  wordA: string; wordB: string;
  ciphers: typeof CIPHER_DEFS;
}) {
  const max = Math.max(...ciphers.flatMap(c => [dataA[c.key]??0, dataB[c.key]??0]), 1);
  return (
    <div className={styles.barsWrap}>
      <div className={styles.barsLegend}>
        <span className={styles.legendDot} style={{background:'var(--a1)'}}/>
        <span className={styles.legendText} style={{color:'var(--a1)'}}>{wordA}</span>
        <span className={styles.legendDot} style={{background:'var(--a4)',marginLeft:'var(--s4)'}}/>
        <span className={styles.legendText} style={{color:'var(--a4)'}}>{wordB}</span>
      </div>
      {ciphers.map(c => {
        const av = dataA[c.key]??0;
        const bv = dataB[c.key]??0;
        return (
          <div key={c.key} className={styles.barRow}>
            <div className={styles.barRowLabel}>{c.name.replace('English Ordinal','Ord.').replace('Eng. Reduction','Reduct.').replace('Reverse Ordinal','Reverse').replace('Hebrew Standard','Hebrew').replace('English ','')}</div>
            <div className={styles.barTrack} style={{marginBottom:'var(--s1)'}}>
              <div className={`${styles.barFill} ${styles.barFillA}`} style={{width:`${(av/max)*100}%`}}/>
              <span className={styles.barVal} style={{color:'var(--a1)'}}>{av}</span>
            </div>
            <div className={styles.barTrack}>
              <div className={`${styles.barFill} ${styles.barFillB}`} style={{width:`${(bv/max)*100}%`}}/>
              <span className={styles.barVal} style={{color:'var(--a4)'}}>{bv}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CSS Dot Grid ──────────────────────────────────────────────────────────────
function DotGridView({ dataA, dataB, wordA, wordB, ciphers }: {
  dataA: Record<string,number>; dataB: Record<string,number>;
  wordA: string; wordB: string;
  ciphers: typeof CIPHER_DEFS;
}) {
  const MAX_DOTS = 81;
  return (
    <div className={styles.dotsWrap}>
      {ciphers.map(c => {
        const av = Math.min(dataA[c.key]??0, MAX_DOTS);
        const bv = Math.min(dataB[c.key]??0, MAX_DOTS);
        return (
          <div key={c.key} className={styles.dotsRow}>
            <div className={styles.dotsLabel}>{c.name.replace('English ','').replace('Standard','Std.')}</div>
            <div className={styles.dotsCols}>
              <div>
                <div className={styles.dotsWord} style={{color:'var(--a1)'}}>{wordA} <em>{dataA[c.key]}</em></div>
                <div className={styles.dotGrid}>
                  {Array.from({length:MAX_DOTS}).map((_,i) => (
                    <div key={i} className={`${styles.dot} ${i < av ? styles.dotActive : styles.dotEmpty}`}
                      style={{background: i < av ? 'var(--a1)' : 'var(--dv)'}}/>
                  ))}
                </div>
              </div>
              <div>
                <div className={styles.dotsWord} style={{color:'var(--a4)'}}>{wordB} <em>{dataB[c.key]}</em></div>
                <div className={styles.dotGrid}>
                  {Array.from({length:MAX_DOTS}).map((_,i) => (
                    <div key={i} className={`${styles.dot} ${i < bv ? styles.dotActive : styles.dotEmpty}`}
                      style={{background: i < bv ? 'var(--a4)' : 'var(--dv)'}}/>
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

// ─── CSS Radar (clip-path hexagon) ────────────────────────────────────────────
function CssRadar({ dataA, dataB, wordA, wordB, ciphers }: {
  dataA: Record<string,number>; dataB: Record<string,number>;
  wordA: string; wordB: string;
  ciphers: typeof CIPHER_DEFS;
}) {
  const n = ciphers.length;
  const max = Math.max(...ciphers.flatMap(c => [dataA[c.key]??0, dataB[c.key]??0]), 1);
  const cx = 50, cy = 50, r = 42;
  const ang = (i: number) => (Math.PI*2*i)/n - Math.PI/2;
  const pt  = (i: number, v: number) => {
    const scale = v/max;
    return `${cx + r*scale*Math.cos(ang(i))}% ${cy + r*scale*Math.sin(ang(i))}%`;
  };
  const ringPts = (scale: number) =>
    ciphers.map((_,i) => `${cx + r*scale*Math.cos(ang(i))}% ${cy + r*scale*Math.sin(ang(i))}%`).join(', ');
  const polyA = ciphers.map((_,i) => pt(i, dataA[ciphers[i].key]??0)).join(', ');
  const polyB = ciphers.map((_,i) => pt(i, dataB[ciphers[i].key]??0)).join(', ');

  return (
    <div className={styles.radarWrap}>
      <div className={styles.radarContainer}>
        <div className={styles.radarBg}/>
        {[0.25, 0.5, 0.75, 1].map(s => (
          <div key={s} className={styles.radarRing}>
            <div className={styles.radarRingInner}
              style={{
                width: `${s*84}%`,
                height: `${s*84}%`,
                clipPath: `polygon(${ringPts(s)})`
              }}/>
          </div>
        ))}
        <div className={styles.radarPolygon} style={{
          clipPath: `polygon(${polyA})`,
          background: `linear-gradient(135deg, color-mix(in oklch, var(--a1) 35%, transparent), color-mix(in oklch, var(--a1) 15%, transparent))`,
          border: `2px solid var(--a1)`,
          borderRadius: 0,
          inset: 0,
          position: 'absolute',
        }}/>
        <div className={styles.radarPolygon} style={{
          clipPath: `polygon(${polyB})`,
          background: `linear-gradient(135deg, color-mix(in oklch, var(--a4) 30%, transparent), color-mix(in oklch, var(--a4) 12%, transparent))`,
          border: `2px solid var(--a4)`,
          borderRadius: 0,
          inset: 0,
          position: 'absolute',
        }}/>
        {ciphers.map((c, i) => {
          const ax = cx + (r+10)*Math.cos(ang(i));
          const ay = cy + (r+10)*Math.sin(ang(i));
          const label = c.name.replace('English Ordinal','Ord').replace('Eng. Reduction','Red').replace('Reverse Ordinal','Rev').replace('Hebrew Standard','Heb').replace('English ','').replace(' Sumerian','Sum').replace('Chaldean','Chd');
          return (
            <div key={c.key} style={{
              position: 'absolute',
              left: `${ax}%`, top: `${ay}%`,
              transform: 'translate(-50%,-50%)',
              fontSize: 'var(--tx0)',
              fontFamily: 'var(--fm)',
              color: 'var(--txm)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}>{label}</div>
          );
        })}
      </div>
      <div className={styles.radarLegend}>
        <div className={styles.radarLegendItem}>
          <div className={styles.radarLegendDot} style={{background:'var(--a1)'}}/>
          <span style={{color:'var(--a1)'}}>{wordA}</span>
        </div>
        <div className={styles.radarLegendItem}>
          <div className={styles.radarLegendDot} style={{background:'var(--a4)'}}/>
          <span style={{color:'var(--a4)'}}>{wordB}</span>
        </div>
      </div>
    </div>
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

function overallSim(dataA: GematriaResponse, dataB: GematriaResponse): number {
  const scores = CIPHER_DEFS.map(d => {
    const av = dataA.ciphers[d.key].total;
    const bv = dataB.ciphers[d.key].total;
    const mx = Math.max(av, bv, 1);
    return (1 - Math.abs(av - bv) / mx) * 100;
  });
  return Math.round(scores.reduce((a,b) => a+b, 0) / scores.length);
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
  const [activeViz, setActiveViz] = useState<'radar'|'bars'|'dots'>('radar');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAnalyze = useCallback((wA: string, wB: string) => {
    const cA = wA.trim(), cB = wB.trim();
    if (!cA || !cB) return;
    router.replace({ pathname: '/compare', query: { wa: cA, wb: cB } }, undefined, { shallow: true });
    fetchGematria(cA).then(setDataA).catch(() => setDataA(null));
    fetchGematria(cB).then(setDataB).catch(() => setDataB(null));
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
      debounceRef.current = setTimeout(() => runAnalyze(wA, wB), 600);
  }

  function handleChangeA(v: string) { setInputA(v); scheduleAnalyze(v, inputB); }
  function handleChangeB(v: string) { setInputB(v); scheduleAnalyze(inputA, v); }
  function handleVS() { if (debounceRef.current) clearTimeout(debounceRef.current); runAnalyze(inputA, inputB); }

  function handleCopyLink() {
    const url = `${window.location.origin}/compare?wa=${encodeURIComponent(inputA.trim())}&wb=${encodeURIComponent(inputB.trim())}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const hasData = dataA !== null && dataB !== null;
  const matchCount = hasData ? CIPHER_DEFS.filter(d => dataA!.ciphers[d.key].total === dataB!.ciphers[d.key].total).length : 0;
  const simScore = hasData ? overallSim(dataA!, dataB!) : 0;
  const simColor = simScore >= 80 ? 'var(--a3)' : simScore >= 50 ? 'var(--a2)' : 'var(--a4)';

  const VIZ_TABS: { id: 'radar'|'bars'|'dots'; label: string }[] = [
    { id: 'radar', label: 'Radar' },
    { id: 'bars',  label: 'Bars'  },
    { id: 'dots',  label: 'Dots'  },
  ];

  return (
    <>
      <Head>
        <title>Compare — Gematria Engine</title>
        <meta name="description" content="Compare two words across 6 Gematria ciphers."/>
      </Head>

      <div className={styles.page}>

        {/* Header */}
        <header className={styles.hdr}>
          <div className={styles.hdrLeft}><Link href="/"><Logo/></Link></div>
          <div className={styles.hdrRight}>
            {hasData && (
              <button className={styles.shareBtn} onClick={handleCopyLink}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

        {/* Inputs */}
        <div className={styles.inputs}>
          <div className={styles.inputWrap}>
            <label className={styles.lbl} htmlFor="word-a">Word A</label>
            <input id="word-a" className={styles.inp} list="words-list"
              value={inputA} onChange={e => handleChangeA(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleVS()}
              placeholder="e.g. George" spellCheck={false} autoComplete="off"/>
          </div>
          <button className={styles.vs} onClick={handleVS} type="button">VS</button>
          <div className={styles.inputWrap}>
            <label className={styles.lbl} htmlFor="word-b">Word B</label>
            <input id="word-b" className={styles.inp} list="words-list"
              value={inputB} onChange={e => handleChangeB(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleVS()}
              placeholder="e.g. Fire" spellCheck={false} autoComplete="off"/>
          </div>
          <datalist id="words-list">
            {WORD_LIST.slice(0,80).map(w => <option key={w} value={w}/>)}
          </datalist>
        </div>

        {/* Results */}
        {hasData && (
          <div className={styles.resultWrap}>

            {/* Bento top row */}
            <div className={styles.bentoTop}>

              {/* Match badge */}
              <div className={styles.matchCard} data-full={String(matchCount===CIPHER_DEFS.length)}>
                <div className={styles.matchNum}>{matchCount}</div>
                <div className={styles.matchDenom}>of {CIPHER_DEFS.length}</div>
                <div className={styles.matchLabel}>match{matchCount!==1?'es':''}</div>
              </div>

              {/* Similarity */}
              <div className={styles.simCard} style={{'--sim-color': simColor} as React.CSSProperties}>
                <div className={styles.gaugeArc} style={{'--pct': simScore} as React.CSSProperties}/>
                <div className={styles.simPctBig}>{simScore}%</div>
                <div className={styles.simLabel}>similarity</div>
              </div>

              {/* Viz tabs */}
              <div className={styles.vizTabsCard}>
                <div className={styles.vizTabsLabel}>View</div>
                {VIZ_TABS.map(t => (
                  <button key={t.id}
                    className={`${styles.vizTab} ${activeViz===t.id?styles.vizTabActive:''}`}
                    onClick={() => setActiveViz(t.id)}>
                    <span className={styles.vizTabDot}/>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Viz panel */}
            <div className={styles.vizPanel}>
              {activeViz==='radar' && (
                <CssRadar
                  dataA={totals(dataA!)} dataB={totals(dataB!)}
                  wordA={dataA!.original_input} wordB={dataB!.original_input}
                  ciphers={CIPHER_DEFS}/>
              )}
              {activeViz==='bars' && (
                <CssBarChart
                  dataA={totals(dataA!)} dataB={totals(dataB!)}
                  wordA={dataA!.original_input} wordB={dataB!.original_input}
                  ciphers={CIPHER_DEFS}/>
              )}
              {activeViz==='dots' && (
                <DotGridView
                  dataA={totals(dataA!)} dataB={totals(dataB!)}
                  wordA={dataA!.original_input} wordB={dataB!.original_input}
                  ciphers={CIPHER_DEFS}/>
              )}
            </div>

            {/* Table */}
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span className={styles.thCipher}>Cipher</span>
                <span className={styles.thWord} style={{color:'var(--a1)'}}>{dataA!.original_input}</span>
                <span className={styles.thPct}>Sim%</span>
                <span className={styles.thDiff}>Δ</span>
                <span className={styles.thWord} style={{color:'var(--a4)'}}>{dataB!.original_input}</span>
              </div>

              {CIPHER_DEFS.map(d => {
                const av = dataA!.ciphers[d.key].total;
                const bv = dataB!.ciphers[d.key].total;
                const diff = av - bv;
                const match = av === bv;
                const maxV = Math.max(av,bv,1);
                const sim = Math.round((1 - Math.abs(diff)/maxV)*100);
                const aWins = av > bv;
                const bWins = bv > av;
                const open = showBreakdown === d.key;
                return (
                  <div key={d.key}>
                    <div
                      className={`${styles.tableRow} ${match?styles.match:''}`}
                      onClick={() => setShowBreakdown(open?null:d.key)}
                      role="button" tabIndex={0}
                      onKeyDown={e => e.key==='Enter' && setShowBreakdown(open?null:d.key)}
                      aria-expanded={open}
                    >
                      <div>
                        <div className={styles.cName}>{d.name}</div>
                        <div className={styles.cSub}>{d.sub}</div>
                      </div>
                      <div className={styles.valCol}>
                        <div className={`${styles.val} ${aWins?styles.winnerVal:''}`} style={{color:'var(--a1)'}}>{av}</div>
                        <div className={styles.bar}><div className={styles.barInA} style={{width:`${(av/maxV)*100}%`}}/></div>
                      </div>
                      <div className={styles.simCol}>
                        <span className={styles.simPct}>{sim}%</span>
                      </div>
                      <div className={styles.diff} style={{color:match?'var(--a3)':diff>0?'var(--a1)':'var(--a4)'}}>
                        {match?'=':diff>0?`+${diff}`:String(diff)}
                      </div>
                      <div className={styles.valCol}>
                        <div className={`${styles.val} ${bWins?styles.winnerVal:''}`} style={{color:'var(--a4)'}}>{bv}</div>
                        <div className={styles.bar}><div className={styles.barInB} style={{width:`${(bv/maxV)*100}%`}}/></div>
                      </div>
                    </div>
                    {open && (
                      <div className={styles.breakdown}>
                        <div className={styles.bdSection}>
                          <span style={{color:'var(--a1)',fontWeight:600}}>{dataA!.original_input}</span>
                          <div className={styles.bdLetters}>
                            {Object.entries(dataA!.ciphers[d.key].breakdown).map(([k,v]) => (
                              <span key={k} className={styles.bdPill}>{k}<em>{v}</em></span>
                            ))}
                          </div>
                          <div className={styles.bdMatches}>Matches: {dataA!.ciphers[d.key].matching_words.filter(w=>w!=='—').join(', ')||'none'}</div>
                        </div>
                        <div className={styles.bdSection}>
                          <span style={{color:'var(--a4)',fontWeight:600}}>{dataB!.original_input}</span>
                          <div className={styles.bdLetters}>
                            {Object.entries(dataB!.ciphers[d.key].breakdown).map(([k,v]) => (
                              <span key={k} className={styles.bdPill}>{k}<em>{v}</em></span>
                            ))}
                          </div>
                          <div className={styles.bdMatches}>Matches: {dataB!.ciphers[d.key].matching_words.filter(w=>w!=='—').join(', ')||'none'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className={styles.summary}>
                <span>Numerology: <strong style={{color:'var(--a1)'}}>{dataA!.base_number}</strong></span>
                <span className={styles.summaryCenter}>base numbers</span>
                <span style={{textAlign:'right'}}>Numerology: <strong style={{color:'var(--a4)'}}>{dataB!.base_number}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasData && (
          <div className={styles.empty}>
            <div className={styles.emptyOrb}/>
            <div className={styles.emptyTitle}>Compare two words</div>
            <p className={styles.emptyText}>Results appear automatically after 2+ characters in each field.</p>
            <p className={styles.emptyHint}>Or press <kbd>VS</kbd> to compare instantly.</p>
          </div>
        )}
      </div>
    </>
  );
}
