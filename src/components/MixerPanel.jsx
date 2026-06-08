import { useMemo } from 'react';
import { CHANNEL_COLORS } from '../constants/defaults';
import styles from '../styles/MixerPanel.module.css';

const CHANNEL_ICONS = {
  nature: '🌿',
  city: '🏙️',
  music: '🎵',
  ambient: '🌊',
  white_noise: '🤍',
  voice: '🎙️',
};

export default function MixerPanel({ channels, masterVolume, onMasterVolume, onChannelVolume, onToggleChannel, onRemoveChannel, onToggleAll, allPlaying }) {
  const sorted = useMemo(() => {
    return [...channels].sort((a, b) => {
      const aOn = a.playing !== false ? 0 : 1;
      const bOn = b.playing !== false ? 0 : 1;
      return aOn - bOn;
    });
  }, [channels]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Mixer</span>
        <button className={styles.toggleAll} onClick={onToggleAll}>
          {allPlaying ? '⏸ All' : '▶️ All'}
        </button>
      </div>

      {channels.length === 0 && (
        <div className={styles.empty}>Add sounds from the browser below</div>
      )}

      <div className={styles.channelList}>
        {sorted.map((ch) => {
          const color = CHANNEL_COLORS[ch.category] || CHANNEL_COLORS.custom;
          const isActive = ch.playing !== false;
          return (
            <div
              key={ch.id}
              className={`${styles.channel} ${isActive ? styles.channelActive : ''}`}
              style={{ '--ch-color': color }}
            >
              <button className={styles.chToggle} onClick={() => onToggleChannel(ch.id)}>
                <span>{CHANNEL_ICONS[ch.category] || '🔊'}</span>
              </button>
              <div className={styles.chInfo}>
                <span className={styles.chName}>{ch.name}</span>
                <span className={styles.chVol}>{ch.volume ?? 50}%</span>
              </div>
              <input
                className={styles.chSlider}
                type="range"
                min="0"
                max="100"
                value={ch.volume ?? 50}
                onChange={(e) => onChannelVolume(ch.id, Number(e.target.value))}
              />
              <button className={styles.chRemove} onClick={() => onRemoveChannel(ch.id)}>✕</button>
            </div>
          );
        })}
      </div>

      <div className={styles.masterSection}>
        <span className={styles.masterLabel}>Master</span>
        <span className={styles.masterPct}>{masterVolume}%</span>
        <input
          className={styles.masterSlider}
          type="range"
          min="0"
          max="100"
          value={masterVolume}
          onChange={(e) => onMasterVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
