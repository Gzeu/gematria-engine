import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { CIPHER_DEFS, WORD_LIST } from '@/lib/gematria-engine';
import type { GematriaResponse, CipherKey } from '@/lib/gematria-engine';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import styles from '@/styles/Compare.module.css';

// ─── Radar SVG ────────────────────────────────────────────────────────────────
function RadarChart({ a, b, ciphers }: { a: Record<string,number>; b: Record<string,number>; ciphers: typeof CIPHER_DEFS }) {
  const cx = 130, cy = 130, r = 95;
  const n = ciphers.length;
  const max = Math.max(...ciphers.flatMap(c => [a[c.key]??0, b[c.key]??0]), 1);
  const ang = (i: number) => (Math.PI*2*i)/n - Math.PI/2;
  const pt  = (i: number, v: number) => ({ x: cx + r*(v/max)*Math.cos(ang(i)), y: cy + r*(v/max)*Math.sin(ang(i)) });
  const ax  = (i: number) => ({ x: cx + r*Math.cos(ang(i)), y: cy + r*Math.sin(ang(i)) });
  const poly = (vals: number[]) => vals.map((v,i)=>{ const p=pt(i,v); return `${p.x},${p.y}`; }).join(' ');
  return (
    <svg viewBox="0 0 260 260" width="100%" style={{maxWidth:260}} aria-label="Radar chart">
      <defs>
        <radialGradient id="rg-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--a1)" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="var(--a1)" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="rg-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--a4)" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="var(--a4)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {[0.25,0.5,0.75,1].map(ring => (
        <polygon key={ring}
          points={ciphers.map((_,i)=>{ const p=ax(i); return `${cx+(p.x-cx)*ring},${cy+(p.y-cy)*ring}`; }).join(' ')}
          fill="none" stroke="var(--br)" strokeWidth={ring===1?1:0.6} strokeDasharray={ring<1?'3 3':undefined}/>
      ))}
      {ciphers.map((_,i)=>{ const p=ax(i); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--br)" strokeWidth={0.6}/>; })}
      <polygon points={poly(ciphers.map(c=>a[c.key]??0))} fill="url(#rg-a)" stroke="var(--a1)" strokeWidth={2} strokeLinejoin="round"/>
      <polygon points={poly(ciphers.map(c=>b[c.key]??0))} fill="url(#rg-b)" stroke="var(--a4)" strokeWidth={2} strokeLinejoin="round"/>
      {ciphers.map((c,i)=>{ const p=pt(i,a[c.key]??0); return <circle key={`a-${i}`} cx={p.x} cy={p.y} r={3} fill="var(--a1)"/>; })}
      {ciphers.map((c,i)=>{ const p=pt(i,b[c.key]??0); return <circle key={`b-${i}`} cx={p.x} cy={p.y} r={3} fill="var(--a4)"/>; })}
      {ciphers.map((c,i)=>{
        const p=ax(i); const lx=cx+(p.x-cx)*1.22; const ly=cy+(p.y-cy)*1.22;
        const label=c.name.replace('English Ordinal','Eng.Ord.').replace('Eng. Reduction','Reduct.').replace('Reverse Ordinal','Reverse').replace('Hebrew Standard','Hebrew');
        return <text key={c.key} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={7.5} fill="var(--txm)" fontFamily="var(--fm)">{label}</text>;
      })}
    </svg>
  );
}

// ─── Similarity Gauge SVG ─────────────────────────────────────────────────────
function SimilarityGauge({ pct, color }: { pct: number; color: string }) {
  const r = 36, stroke = 8;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const dash = (pct / 100) * half;
  return (
    <svg viewBox="0 0 96 56" width={96} height={56} aria-label={`Similarity ${pct}%`}>
      <path d={`M ${96/2 - r} 48 A ${r} ${r} 0 0 1 ${96/2 + r} 48`} fill="none" stroke="var(--dv)" strokeWidth={stroke} strokeLinecap="round"/>
      <path d={`M ${96/2 - r} 48 A ${r} ${r} 0 0 1 ${96/2 + r} 48`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${half}`} style={{transition:'stroke-dasharray .8s cubic-bezier(.16,1,.3,1)'}}/>
      <text x="48" y="42" textAnchor="middle" fontSize={13} fontWeight={700} fill={color} fontFamily="var(--fm)">{pct}%</text>
    </svg>
  );
}

// ─── Horizontal Bar Chart SVG ────────────────────────────────────────────────
function BarChart({ dataA, dataB, ciphers }: { dataA: Record<string,number>; dataB: Record<string,number>; ciphers: typeof CIPHER_DEFS }) {
  const W = 320, rowH = 36, pad = 8, labelW = 70, barArea = W - labelW - pad*2;
  const max = Math.max(...ciphers.flatMap(c => [dataA[c.key]??0, dataB[c.key]??0]), 1);
  const H = ciphers.length * rowH + pad * 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{maxWidth:W}} aria-label="Bar chart comparison">
      {ciphers.map((c,i) => {
        const av = dataA[c.key]??0;
        const bv = dataB[c.key]??0;
        const y = pad + i * rowH;
        const wA = (av/max)*barArea;
        const wB = (bv/max)*barArea;
        return (
          <g key={c.key}>
            <text x={labelW-4} y={y+9} textAnchor="end" fontSize={7} fill="var(--txm)" fontFamily="var(--fm)" dominantBaseline="middle">
              {c.name.replace('English ','').replace(' Ordinal','Ord.').replace('Standard','Std.')}
            </text>
            {/* Word A bar */}
            <rect x={labelW} y={y} width={wA} height={14} rx={3} fill="var(--a1)" fillOpacity={0.85}
              style={{transition:'width .7s cubic-bezier(.16,1,.3,1)'}}/>
            <text x={labelW+wA+3} y={y+7} fontSize={7} fill="var(--a1)" fontFamily="var(--fm)" dominantBaseline="middle">{av}</text>
            {/* Word B bar */}
            <rect x={labelW} y={y+16} width={wB} height={14} rx={3} fill="var(--a4)" fillOpacity={0.85}
              style={{transition:'width .7s cubic-bezier(.16,1,.3,1)'}}/>
            <text x={labelW+wB+3} y={y+23} fontSize={7} fill="var(--a4)" fontFamily="var(--fm)" dominantBaseline="middle">{bv}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Dot Matrix for a number ─────────────────────────────────────────────────
function DotMatrix({ value, color }: { value: number; color: string }) {
  const dots = Math.min(value, 81); // max 9x9
  const cols = 9;
  const rows = Math.ceil(dots / cols);
  const size = 5, gap = 3;
  const W = cols*(size+gap), H = rows*(size+gap);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-label={`${value} dots`} style={{maxWidth:'100%'}}>
      {Array.from({length:dots}).map((_,i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return <rect key={i} x={col*(size+gap)} y={row*(size+gap)} width={size} height={size} rx={1.5} fill={color} fillOpacity={0.75}/>;
      })}
    </svg>
  );
}

// ─── Decorative mesh background SVG ─────────────────────────────────────────
function MeshBg() {
  return (
    <svg aria-hidden="true" viewBox="0 0 800 160" width="100%" height={160}
      style={{position:'absolute',top:0,left:0,pointerEvents:'none',zIndex:0,opacity:0.35}}>
      <defs>
        <radialGradient id="mg1" cx="20%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--a1)" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="var(--a1)" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="mg2" cx="80%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--a4)" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="var(--a4)" stopOpacity="0"/>
        </radialGradient>
        <filter id="blur-mesh"><feGaussianBlur stdDeviation="18"/></filter>
      </defs>
      <rect width="800" height="160" fill="url(#mg1)" filter="url(#blur-mesh)"/>
      <rect width="800" height="160" fill="url(#mg2)" filter="url(#blur-mesh)"/>
      {Array.from({length:18}).map((_,i) => (
        <circle key={i} cx={(i%6)*140+40} cy={(Math.floor(i/6))*60+30} r={1.5}
          fill="var(--br)" fillOpacity={0.6}/>
      ))}
      {Array.from({length:18}).map((_,i) => {
        const x1=(i%6)*140+40, y1=(Math.floor(i/6))*60+30;
        const x2=((i+1)%6)*140+40, y2=(Math.floor((i+1)/6))*60+30;
        return i%6!==5 ? <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--br)" strokeWidth={0.5} strokeOpacity={0.5}/> : null;
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
    const cA = wA.trim(), cB = wB.trim();
    if (!cA || !cB) return;
    router.replace({ pathname: '/compare', query: { wa: cA, wb: cB } }, undefined, { shallow: true });
    fetchGematria(cA).then(setDataA).catch(() => setDataA(null));
    fetchGematria(cB).then(setDataB).catch(() => setDataB(null));
  }

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

  return (
    <>
      <Head>
        <title>Compare — Gematria Engine</title>
        <meta name="description" content="Compare two words across 6 Gematria ciphers with radar chart, match score, and shareable URL."/>
      </Head>

      <div className={styles.page}>

        {/* ── Hero header with mesh bg ── */}
        <header className={styles.hdr}>
          <MeshBg/>
          <div className={styles.hdrInner}>
            <div className={styles.hdrLeft}><Link href="/"><Logo/></Link></div>
            <div className={styles.hdrRight}>
              {hasData && (
                <button className={styles.shareBtn} onClick={handleCopyLink} title="Copy shareable link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  {copied ? 'Copied!' : 'Share'}
                </button>
              )}
              <ThemeToggle/>
            </div>
          </div>
        </header>

        {/* ── Inputs ── */}
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

        {/* ── Results ── */}
        {hasData && (
          <div className={styles.resultWrap}>

            {/* ── Stats row: badge + gauge + radar/bars/dots selector ── */}
            <div className={styles.statsRow}>

              {/* Match badge */}
              <div className={styles.matchBadge} data-full={String(matchCount===CIPHER_DEFS.length)}>
                <span className={styles.matchNum}>{matchCount}</span>
                <span className={styles.matchOf}>/{CIPHER_DEFS.length}</span>
                <span className={styles.matchLabel}>cipher{matchCount!==1?'s':''} match</span>
              </div>

              {/* Overall similarity gauge */}
              <div className={styles.gaugeWrap}>
                <SimilarityGauge pct={simScore} color={simColor}/>
                <span className={styles.gaugeLabel}>overall similarity</span>
              </div>

              {/* Viz selector tabs */}
              <div className={styles.vizTabs}>
                {(['radar','bars','dots'] as const).map(t => (
                  <button key={t} className={`${styles.vizTab} ${activeViz===t?styles.vizTabActive:''}`}
                    onClick={() => setActiveViz(t)}>
                    {t==='radar'?'🕸 Radar':t==='bars'?'▬ Bars':'∷ Dots'}
                  </button>
                ))}
              </div>

            </div>

            {/* ── Visualization panel ── */}
            <div className={styles.vizPanel}>
              {activeViz==='radar' && (
                <div className={styles.radarWrap}>
                  <RadarChart a={totals(dataA!)} b={totals(dataB!)} ciphers={CIPHER_DEFS}/>
                  <div className={styles.radarLegend}>
                    <span style={{color:'var(--a1)'}}>◼ {dataA!.original_input}</span>
                    <span style={{color:'var(--a4)'}}>◼ {dataB!.original_input}</span>
                  </div>
                </div>
              )}
              {activeViz==='bars' && (
                <div className={styles.barsWrap}>
                  <div className={styles.barsLegend}>
                    <span style={{color:'var(--a1)'}}>◼ {dataA!.original_input}</span>
                    <span style={{color:'var(--a4)'}}>◼ {dataB!.original_input}</span>
                  </div>
                  <BarChart dataA={totals(dataA!)} dataB={totals(dataB!)} ciphers={CIPHER_DEFS}/>
                </div>
              )}
              {activeViz==='dots' && (
                <div className={styles.dotsWrap}>
                  {CIPHER_DEFS.map(d => {
                    const av = dataA!.ciphers[d.key].total;
                    const bv = dataB!.ciphers[d.key].total;
                    return (
                      <div key={d.key} className={styles.dotsRow}>
                        <span className={styles.dotsLabel}>{d.name.replace('English ','').replace('Standard','Std.')}</span>
                        <div className={styles.dotsCols}>
                          <div>
                            <div className={styles.dotsWord} style={{color:'var(--a1)'}}>{dataA!.original_input} <em>{av}</em></div>
                            <DotMatrix value={av} color="var(--a1)"/>
                          </div>
                          <div>
                            <div className={styles.dotsWord} style={{color:'var(--a4)'}}>{dataB!.original_input} <em>{bv}</em></div>
                            <DotMatrix value={bv} color="var(--a4)"/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Table ── */}
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span className={styles.thCipher}>Cipher</span>
                <span className={styles.thWord} style={{color:'var(--a1)'}}>{dataA!.original_input}</span>
                <span className={styles.thPct}>Sim %</span>
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
                        <div className={styles.val} style={{color:'var(--a1)',fontWeight:aWins?800:500}}>{av}</div>
                        <div className={styles.bar}><div className={styles.barFillA} style={{width:`${(av/maxV)*100}%`}}/></div>
                      </div>
                      <div className={styles.simCol}>
                        <span className={styles.simPct} style={{opacity:sim/100*0.7+0.3}}>{sim}%</span>
                      </div>
                      <div className={styles.diff} style={{color:match?'var(--a3)':diff>0?'var(--a1)':'var(--a4)'}}>
                        {match?'=':diff>0?`+${diff}`:String(diff)}
                      </div>
                      <div className={styles.valCol}>
                        <div className={styles.val} style={{color:'var(--a4)',fontWeight:bWins?800:500}}>{bv}</div>
                        <div className={styles.bar}><div className={styles.barFillB} style={{width:`${(bv/maxV)*100}%`}}/></div>
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
                <span style={{color:'var(--txm)'}}>base numbers</span>
                <span style={{textAlign:'right'}}>Numerology: <strong style={{color:'var(--a4)'}}>{dataB!.base_number}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!hasData && (
          <div className={styles.empty}>
            <div className={styles.emptyGlyph}>
              <svg viewBox="0 0 80 80" width={80} height={80} aria-hidden="true">
                <circle cx="40" cy="40" r="30" fill="none" stroke="var(--br)" strokeWidth="1.5" strokeDasharray="4 4"/>
                <circle cx="40" cy="40" r="18" fill="none" stroke="var(--br)" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="10" y1="40" x2="70" y2="40" stroke="var(--br)" strokeWidth="1"/>
                <line x1="40" y1="10" x2="40" y2="70" stroke="var(--br)" strokeWidth="1"/>
                <circle cx="40" cy="40" r="3" fill="var(--txf)"/>
              </svg>
            </div>
            <p>Enter two words above — results appear automatically after 2 characters.</p>
            <p className={styles.emptyHint}>Or press <kbd>VS</kbd> to compare instantly.</p>
          </div>
        )}
      </div>
    </>
  );
}
