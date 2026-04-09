import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%230d0b13'/><circle cx='16' cy='16' r='8.5' stroke='%23a78bfa' stroke-width='1.4' fill='none'/><text x='16' y='21' text-anchor='middle' font-size='12' fill='%23a78bfa' font-family='serif' font-style='italic'>ג</text></svg>" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var s=sessionStorage.getItem('theme');
            var m=window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', s||(m?'dark':'light'));
          })()
        `}} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
