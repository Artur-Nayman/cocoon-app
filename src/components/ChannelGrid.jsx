import { CHANNEL_COLORS } from '../constants/defaults';
import styles from '../styles/ChannelGrid.module.css';

const CHANNEL_ICONS = {
  nature: '🌿',
  city: '🏙️',
  music: '🎵',
  ambient: '🌊',
  white_noise: '🤍',
  voice: '🎙️',
};

export default function ChannelGrid({ channels, onToggle, onVolume, onRemove }) {
  return (
    <div className={styles.grid}>
      {channels.length === 0 && (
        <div className={styles.empty}>
          <span>No sounds active</span>
          <span className={styles.emptyHint}>Browse sounds below to add them</span>
        </div>
      )}
      {channels.map((ch) => {
        const color = CHANNEL_COLORS[ch.category] || CHANNEL_COLORS.custom;
        const isActive = ch.playing !== false;
        return (
          <div
            key={ch.id}
            className={`${styles.card} ${isActive ? styles.active : ''}`}
            style={{ '--channel-color': color }}
          >
            <button
              className={styles.toggleBtn}
              onClick={() => onToggle(ch.id)}
              style={{ background: isActive ? color : 'transparent' }}
            >
              <span className={styles.icon}>{CHANNEL_ICONS[ch.category] || '🔊'}</span>
            </button>
            <div className={styles.info}>
              <span className={styles.name}>{ch.name}</span>
              <input
                className={styles.slider}
                type="range"
                min="0"
                max="100"
                value={ch.volume ?? 50}
                onChange={(e) => onVolume(ch.id, Number(e.target.value))}
              />
            </div>
            <button className={styles.removeBtn} onClick={() => onRemove(ch.id)}>✕</button>
          </div>
        );
      })}
    </div>
  );
}
