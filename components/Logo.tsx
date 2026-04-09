import styles from '@/styles/Logo.module.css';

export default function Logo() {
  return (
    <div className={styles.logo}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Gematria Engine">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.1" opacity=".15" />
        <circle cx="16" cy="16" r="8.5" stroke="var(--pr)" strokeWidth="1.4" />
        <text x="16" y="21" textAnchor="middle" fontSize="12" fill="var(--pr)" fontFamily="serif" fontStyle="italic">ג</text>
        <line x1="16" y1="1.5" x2="16" y2="6.5" stroke="var(--pr)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="16" y1="25.5" x2="16" y2="30.5" stroke="var(--pr)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="1.5" y1="16" x2="6.5" y2="16" stroke="var(--pr)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="25.5" y1="16" x2="30.5" y2="16" stroke="var(--pr)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <div>
        <div className={styles.name}>Gematria</div>
        <div className={styles.ver}>Engine · 6 ciphers</div>
      </div>
    </div>
  );
}
