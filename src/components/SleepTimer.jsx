import styles from '../styles/SleepTimer.module.css';

const OPTIONS = [
  { min: 15, label: '15m' },
  { min: 30, label: '30m' },
  { min: 60, label: '1h' },
  { min: 120, label: '2h' },
];

export default function SleepTimer({ minutes, label, onToggle }) {
  return (
    <div className={styles.timer}>
      <span className={styles.label}>Sleep Timer</span>
      <div className={styles.options}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.min}
            className={`${styles.pill} ${minutes === opt.min ? styles.active : ''}`}
            onClick={() => onToggle(opt.min)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {label && <span className={styles.countdown}>{label}</span>}
    </div>
  );
}
