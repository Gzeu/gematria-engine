import { useState } from 'react';
import type { GematriaResponse } from '@/lib/gematria-engine';
import styles from '@/styles/JsonOutput.module.css';

type Props = { data: GematriaResponse };

function highlight(json: string): string {
  return json
    .replace(/("[^"]+")\s*:/g, '<span class="jk">$1</span>:')
    .replace(/:\s*("[^"]+")/g, ': <span class="js">$1</span>')
    .replace(/:\s*(\d+)/g, ': <span class="jn">$1</span>');
}

export default function JsonOutput({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  function copy() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={styles.box}>
      <div className={styles.top}>
        <span className={styles.lbl}>JSON Output</span>
        <button
          className={`${styles.cpBtn} ${copied ? styles.ok : ''}`}
          onClick={copy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        className={styles.pre}
        dangerouslySetInnerHTML={{ __html: highlight(json) }}
      />
    </div>
  );
}
