import { useMemo } from 'react';
import { extractYtId } from '../utils/youtube';
import styles from '../styles/VoiceControlPanel.module.css';

const layerDefs = [
  { key: 'visual', label: 'Video', emoji: '🎬', category: 'visual' },
  { key: 'melodic', label: 'Music', emoji: '🎵', category: 'melodic' },
  { key: 'atmospheric', label: 'Atmospheric', emoji: '🌿', category: 'atmospheric' },
];

function resourceName(layer, config, resources) {
  const cfg = config[layer.key];
  if (!cfg) return null;

  if (layer.key === 'visual') {
    const id = cfg.videoId;
    if (!id) return null;
    const r = resources.find(
      (res) => res.category === 'visual' && extractYtId(res.url) === id
    );
    return r?.name ?? null;
  }

  const url = cfg.url;
  if (!url) return null;
  const r = resources.find((res) => res.category === layer.category && res.url === url);
  return r?.name ?? null;
}

export default function VoiceControlPanel({ config, onChange, playing, onTogglePlay, resources, onToggleAll }) {
  const allPlaying = playing.visual && playing.melodic && playing.atmospheric;

  const names = useMemo(
    () => Object.fromEntries(layerDefs.map((l) => [l.key, resourceName(l, config, resources)])),
    [config, resources],
  );

  return (
    <div className={styles.panel}>
      {layerDefs.map(({ key, label, emoji }) => {
        const name = names[key];
        return (
          <div key={key} className={styles.row}>
            <div className={styles.header}>
              <span className={styles.emoji}>{emoji}</span>
              <span className={styles.label}>
                {label}{name ? `: ${name}` : ''}
              </span>
              <span className={styles.volPct}>{config[key]?.volume ?? 50}%</span>
            </div>
            <div className={styles.controls}>
              <button
                className={styles.playBtn}
                onClick={() => onTogglePlay(key)}
                aria-label={playing[key] ? `Pause ${label}` : `Play ${label}`}
              >
                {playing[key] ? '⏸' : '▶️'}
              </button>
              <input
                className={styles.slider}
                type="range"
                min="0"
                max="100"
                value={config[key]?.volume ?? 50}
                onChange={(e) => onChange({ ...config, [key]: { ...config[key], volume: Number(e.target.value) } })}
              />
            </div>
          </div>
        );
      })}

      <button className={styles.toggleAllBtn} onClick={onToggleAll}>
        {allPlaying ? '⏸ Pause All' : '▶️ Play All'}
      </button>
    </div>
  );
}
