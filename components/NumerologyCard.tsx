import styles from '../styles/NumerologyCard.module.css';

interface Props {
  summary: string;
}

export default function NumerologyCard({ summary }: Props) {
  // Extract base number from summary string like "...reduces to 7 — The number 7..."
  const match = summary.match(/reduces to (\d+)/);
  const num   = match ? parseInt(match[1]) : null;
  const isMaster = num === 11 || num === 22 || num === 33;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>Numerology</span>
        {num !== null && (
          <span className={`${styles.badge} ${isMaster ? styles.master : ''}`}>
            {isMaster ? `✦ ${num}` : num}
          </span>
        )}
      </div>
      <p className={styles.text}>{summary}</p>
    </div>
  );
}
