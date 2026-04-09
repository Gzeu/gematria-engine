import type { CipherKey, CipherResult } from '../lib/gematria-engine';
import { CIPHER_DEFS } from '../lib/gematria-engine';
import styles from '../styles/CipherPanel.module.css';

interface Props {
  cipher: CipherKey;
  data: CipherResult;
}

export default function CipherPanel({ cipher, data }: Props) {
  const def = CIPHER_DEFS.find(d => d.key === cipher);
  const entries = Object.entries(data.breakdown);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className={styles.wrap}>
      {def && (
        <div className={styles.meta}>
          <span className={styles.sub}>{def.sub}</span>
        </div>
      )}

      <div className={styles.table}>
        <div className={styles.thead}>
          <span>Letter</span>
          <span>Value</span>
          <span>Bar</span>
        </div>
        {entries.map(([k, v]) => (
          <div key={k} className={styles.row}>
            <span className={styles.letter}>{k}</span>
            <span className={styles.val}>{v}</span>
            <div className={styles.barWrap}>
              <div
                className={styles.bar}
                style={{
                  width: `${(v / max) * 100}%`,
                  background: def?.color ?? 'var(--pr)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {data.matching_words?.some(w => w !== '—') && (
        <div className={styles.matches}>
          <span className={styles.matchLbl}>Same value:</span>
          {data.matching_words.filter(w => w !== '—').map((w, i) => (
            <span key={i} className={styles.matchWord}>{w}</span>
          ))}
        </div>
      )}
    </div>
  );
}
