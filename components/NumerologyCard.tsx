import styles from '@/styles/NumerologyCard.module.css';
import { NUMEROLOGY_MEANINGS } from '@/lib/gematria-engine';

type Props = { baseNumber: number; summary: string };

export default function NumerologyCard({ baseNumber }: Props) {
  const isMaster = [11, 22, 33].includes(baseNumber);
  return (
    <div className={styles.card}>
      <div className={styles.lbl}>Numerology</div>
      <div className={styles.number}>
        {baseNumber}
        {isMaster && <span className={styles.master}>Master</span>}
      </div>
      <p className={styles.meaning}>{NUMEROLOGY_MEANINGS[baseNumber]}</p>
    </div>
  );
}
