import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Cryptolinguistic analysis across 6 Gematria ciphers with numerology reduction and JSON output." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300..700&family=Instrument+Serif:ital@0;1&family=Geist:wght@300..700&display=swap" rel="stylesheet" />
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Runs only on client — safe to access window/sessionStorage here
    try {
      const saved = sessionStorage.getItem('theme');
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', saved || system);
    } catch {
      // sessionStorage blocked (e.g. incognito strict mode) — fallback to system
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', system);
    }
  }, []);

  return <>{children}</>;
}
