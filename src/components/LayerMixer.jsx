import styles from '../styles/LayerMixer.module.css';

const layers = [
  { key: 'visual', label: 'Visual', emoji: '🎬' },
  { key: 'melodic', label: 'Melodic', emoji: '🎵' },
  { key: 'atmospheric', label: 'Atmospheric', emoji: '🌿' },
];

export default function LayerMixer({ config, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: { ...config[key], volume: Number(value) } });
  };

  return (
    <div className={styles.mixer}>
      {layers.map(({ key, label, emoji }) => (
        <div className={styles.control} key={key}>
          <div className={styles.header}>
            <span className={styles.emoji}>{emoji}</span>
            <label className={styles.label} htmlFor={`vol-${key}`}>{label}</label>
          </div>
          <input
            id={`vol-${key}`}
            className={styles.slider}
            type="range"
            min="0"
            max="100"
            value={config[key]?.volume ?? 50}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
