import React, { useState, useRef, useCallback } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import type { CipherKey, GematriaResponse } from '../lib/gematria-engine';
import { CIPHER_DEFS } from '../lib/gematria-engine';
import CipherSidebar from '../components/CipherSidebar';
import CipherPanel from '../components/CipherPanel';
import NumerologyCard from '../components/NumerologyCard';
import JsonOutput from '../components/JsonOutput';
import LetterGrid from '../components/LetterGrid';
import RadarChart from '../components/RadarChart';
import BarChart from '../components/BarChart';
import SearchHistory from '../components/SearchHistory';
import GlyphMatrix from '../components/GlyphMatrix';
import ThemeToggle from '../components/ThemeToggle';
import s from '../styles/Home.module.css';

type Tab = 'breakdown' | 'grid' | 'glyph' | 'json';

const HomePage: NextPage = () => {
  const [word, setWord]             = useState('');
  const [result, setResult]         = useState<GematriaResponse | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [cipher, setCipher]         = useState<CipherKey>('english_ordinal');
  const [tab, setTab]               = useState<Tab>('breakdown');
  const [history, setHistory]       = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const analyze = useCallback(async (w?: string) => {
    const q = (w ?? word).trim();
    if (!q) return;
    setLoading(true); setError(null);
    try {
      const res  = await fetch('/api/gematria', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({input:q}) });
      const data = await res.json();
      if (!res.ok || 'error' in data) { setError((data as any).error ?? `Error ${res.status}`); return; }
      setResult(data as GematriaResponse);
      setHistory(h => [...new Set([q, ...h.filter(x => x !== q)])].slice(0,12));
    } catch(e:any) { setError(e.message ?? 'Network error'); }
    finally { setLoading(false); }
  }, [word]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); analyze(); } };

  const cd = result?.ciphers?.[cipher];
  const letters = result ? result.original_input.toUpperCase().replace(/[^A-Z]/g,'').split('') : [];
  const radarData = result ? CIPHER_DEFS.map(d=>({label:d.name.slice(0,3).toUpperCase(),value:result.ciphers[d.key].total,color:d.color})) : [];
  const barData   = result ? CIPHER_DEFS.map(d=>({label:d.name,value:result.ciphers[d.key].total,color:d.color})) : [];
  const tabLabels: Record<Tab,string> = { breakdown:'Table', grid:'Grid', glyph:'Glyph', json:'JSON' };

  return (
    <>
      <Head>
        <title>Gematria Engine</title>
        <meta name="description" content="Advanced gematria analysis across 6 cipher systems" />
      </Head>
      <div className={s.shell}>

        {/* TOP BAR */}
        <header className={s.bar}>
          <div className={s.barLeft}>
            <Link href="/" className={s.logo}>
              <span className={s.logoMark}>ℵ</span>
              <span className={s.logoText}>Gematria</span>
            </Link>
            <nav style={{display:'flex',gap:'var(--s1)',marginLeft:'var(--s4)'}}>
              <Link href="/" className={`${s.navLink} ${s.navActive}`}>Analyze</Link>
              <Link href="/compare" className={s.navLink}>Compare</Link>
            </nav>
          </div>
          <div className={s.barRight}>
            <ThemeToggle />
          </div>
        </header>

        <div className={s.body}>
          {/* SIDEBAR */}
          <aside className={s.side}>
            {result ? (
              <>
                <CipherSidebar data={result} active={cipher} onSelect={setCipher} />
                <div style={{marginTop:'var(--s3)'}}>
                  <NumerologyCard summary={result.numerology_summary} />
                </div>
                <div style={{marginTop:'var(--s3)',background:'rgba(20,18,40,0.6)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'var(--r3)',padding:'var(--s4)'}}>
                  <div className={s.panelLabel} style={{marginBottom:'var(--s4)'}}>Cipher Radar</div>
                  <RadarChart ciphers={radarData} size={200} />
                </div>
              </>
            ) : (
              <div style={{padding:'var(--s4) var(--s2)',color:'var(--ctm)',fontSize:'var(--t2)',lineHeight:1.7,fontStyle:'italic'}}>
                Enter any word or phrase to decode its gematric signature across 6 ancient cipher systems.
              </div>
            )}
          </aside>

          {/* MAIN */}
          <main className={s.main}>
            {/* INPUT */}
            <div className={s.panel}>
              <div className={s.inputWrap}>
                <textarea
                  ref={inputRef}
                  className={s.inputField}
                  rows={1}
                  value={word}
                  onChange={e => setWord(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Type a word…"
                  aria-label="Word or phrase to analyze"
                  spellCheck={false}
                />
                <div className={s.inputLine} style={{transform:word?'scaleX(1)':'scaleX(0)'}} />
              </div>
              <div className={s.inputMeta}>
                <button className={s.btn} onClick={()=>analyze()} disabled={loading||!word.trim()}>
                  {loading ? <span className="dots"><span/><span/><span/></span> : 'Analyze'}
                </button>
                {word && <span className={s.letterCount}>{word.replace(/[^A-Za-z]/g,'').length} letters</span>}
              </div>
              {error && <div className={s.err}>⚠ {error}</div>}
              <SearchHistory history={history} onSelect={w=>{setWord(w);analyze(w);}} onClear={()=>setHistory([])} />
            </div>

            {result ? (
              <>
                {/* BAR CHART */}
                <div className={s.panel}>
                  <div className={s.panelLabel}>All Ciphers</div>
                  <BarChart bars={barData} />
                </div>

                {/* CIPHER DETAIL */}
                {cd && (
                  <div className={s.panel}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'var(--s5)',flexWrap:'wrap',gap:'var(--s3)'}}>
                      <div className={s.panelLabel} style={{marginBottom:0}}>
                        {CIPHER_DEFS.find(d=>d.key===cipher)?.name ?? cipher}
                      </div>
                      <div className={s.valBadge}>
                        <span className={s.valNum}>{cd.total}</span>
                        <span className={s.valLabel}>total</span>
                      </div>
                    </div>
                    <div className={s.tabs} style={{marginBottom:'var(--s5)'}}>
                      {(['breakdown','grid','glyph','json'] as Tab[]).map(t=>(
                        <button key={t} className={`${s.tab} ${tab===t?s.tabOn:''}`} onClick={()=>setTab(t)}>{tabLabels[t]}</button>
                      ))}
                    </div>
                    {tab==='breakdown' && <CipherPanel cipher={cipher} data={cd} />}
                    {tab==='grid' && <LetterGrid letters={letters} values={cd.breakdown} accentVar={`--a${CIPHER_DEFS.findIndex(d=>d.key===cipher)+1}`} />}
                    {tab==='glyph' && <GlyphMatrix word={result.original_input} cipher={cd.breakdown} />}
                    {tab==='json' && <JsonOutput data={result} />}
                  </div>
                )}
              </>
            ) : (
              <div className={s.empty}>
                <div className={s.emptyOrb} />
                <div className={s.emptyTitle}>Gematria Engine</div>
                <div className={s.emptyText}>Decode the numeric value hidden within any word across six ancient cipher systems.</div>
              </div>
            )}
          </main>
        </div>

        {/* MOBILE CIPHER BAR */}
        {result && (
          <div className={s.mobileBar}>
            {CIPHER_DEFS.map(d => (
              <button key={d.key} className={`${s.mobileChip} ${cipher===d.key?'on':''}`} onClick={()=>setCipher(d.key)}>
                <span className={s.mobileChipVal}>{result.ciphers[d.key].total}</span>
                <span className={s.mobileChipLbl}>{d.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
export default HomePage;
