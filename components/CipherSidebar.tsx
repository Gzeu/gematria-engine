import { CIPHER_DEFS, CipherKey, GematriaResponse } from '@/lib/gematria-engine';
import styles from '@/styles/CipherSidebar.module.css';

type Props = {
  data: GematriaResponse;
  active: CipherKey;
  onSelect: (k: CipherKey) => void;
};

export default function CipherSidebar({ data, active, onSelect }: Props) {
  return (
    <div className={styles.list}>
      <div className={styles.lbl}>Ciphers</div>
      {CIPHER_DEFS.map(d => (
        <div
          key={d.key}
          className={`${styles.item} ${d.key === active ? styles.on : ''}`}
          onClick={() => onSelect(d.key)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onSelect(d.key)}
        >
          <div className={styles.left}>
            <div className={styles.dot} style={{ background: d.color }} />
            <span className={styles.name}>{d.name}</span>
          </div>
          <span
            className={styles.total}
            style={{ color: d.key === active ? 'var(--pr)' : undefined }}
          >
            {data.ciphers[d.key].total}
          </span>
        </div>
      ))}
    </div>
  );
}
