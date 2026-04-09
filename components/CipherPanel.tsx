import { CipherResult, CIPHER_DEFS } from '@/lib/gematria-engine';
import styles from '@/styles/CipherPanel.module.css';

type Def = typeof CIPHER_DEFS[number];

type Props = {
  def: Def;
  cipher: CipherResult;
};

export default function CipherPanel({ def, cipher }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <div className={styles.name} style={{ color: def.color }}>{def.name}</div>
          <div className={styles.sub}>{def.sub}</div>
        </div>
        <div className={styles.total} style={{ color: def.color }}>{cipher.total}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.sectionLabel}>Character Breakdown</div>
        <div className={styles.breakdown}>
          {Object.entries(cipher.breakdown).map(([k, v]) => (
            <div key={k} className={styles.lc}>
              <span className={styles.lcChar}>{k.replace(/\d+$/, '')}</span>
              <span className={styles.lcVal}>{v}</span>
            </div>
          ))}
        </div>

        <div className={styles.sectionLabel}>Words with same value</div>
        <div className={styles.pills}>
          {cipher.matching_words.map((w, i) => (
            <span
              key={i}
              className={`${styles.pill} ${w === '—' ? styles.pillEmpty : ''}`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
