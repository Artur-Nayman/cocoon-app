import { useState } from 'react';
import styles from '../styles/App.module.css';

const THEMES = [
  { key: 'light', label: 'Light', color: '#fdf5e6' },
  { key: 'warm', label: 'Warm', color: '#f5e6d3' },
  { key: 'dark', label: 'Dark', color: '#1a1a2e' },
  { key: 'black', label: 'Black', color: '#000000' },
  { key: 'claude', label: 'Claude', color: '#f2f2f2' },
  { key: 'claw', label: 'Claw', color: '#0d0d0d' },
  { key: 'opencode', label: 'Opencode', color: '#212121' },
  { key: 'coffee', label: 'Coffee', color: '#3e2723' },
];

const ANIMATIONS = [
  { key: '', label: 'None' },
  { key: 'gradient', label: 'Gradient Drift' },
  { key: 'aurora', label: 'Aurora' },
  { key: 'particles', label: 'Floating Particles' },
];

export default function ThemeSwitcher({ theme, bgType, bgValue, showVinyl, showMusicName, onThemeChange, onBgTypeChange, onBgValueChange, onVinylToggle, onMusicNameToggle, onClose, zenBgMode, onZenBgChange }) {
  const [customTab, setCustomTab] = useState('color');

  return (
    <div className={styles.themePopup}>
      <div className={styles.themeHeader}>
        <span>Theme</span>
        <button className={styles.themeClose} onClick={onClose}>&times;</button>
      </div>

      <div className={styles.themeGrid}>
        {THEMES.map((t) => (
          <button
            key={t.key}
            className={`${styles.themeSwatch} ${theme === t.key ? styles.themeSwatchActive : ''}`}
            style={{ '--swatch-color': t.color }}
            onClick={() => onThemeChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.themeSection}>
        <span className={styles.themeSectionLabel}>Custom Background</span>

        <div className={styles.themePills}>
          {['color', 'image', 'animation'].map((tab) => (
            <button
              key={tab}
              className={`${styles.themePill} ${customTab === tab ? styles.themePillActive : ''}`}
              onClick={() => setCustomTab(tab)}
            >
              {tab === 'color' ? 'Color' : tab === 'image' ? 'Image' : 'Animation'}
            </button>
          ))}
        </div>

        {customTab === 'color' && (
          <div className={styles.themeColorRow}>
            <input
              type="color"
              value={bgType === 'color' ? bgValue : '#fdf5e6'}
              onChange={(e) => { onBgTypeChange('color'); onBgValueChange(e.target.value); }}
              className={styles.themeColorPicker}
            />
            <span className={styles.themeColorValue}>{bgType === 'color' ? bgValue : ''}</span>
            <button
              className={styles.themeClearBtn}
              onClick={() => { onBgTypeChange(''); onBgValueChange(''); }}
            >
              Clear
            </button>
          </div>
        )}

        {customTab === 'image' && (
          <div className={styles.themeImageRow}>
            <input
              type="text"
              className={styles.themeImageInput}
              value={bgType === 'image' ? bgValue : ''}
              onChange={(e) => { onBgTypeChange('image'); onBgValueChange(e.target.value); }}
              placeholder="Paste image URL…"
            />
            {bgType === 'image' && bgValue && (
              <div className={styles.themePreview} style={{ backgroundImage: `url(${bgValue})` }} />
            )}
          </div>
        )}

        {customTab === 'animation' && (
          <div className={styles.themeAnimRow}>
            {ANIMATIONS.map((a) => (
              <button
                key={a.key}
                className={`${styles.themeAnimPill} ${bgType === 'animation' && bgValue === a.key ? styles.themeAnimPillActive : ''}`}
                onClick={() => {
                  if (a.key) {
                    onBgTypeChange('animation');
                    onBgValueChange(a.key);
                  } else {
                    onBgTypeChange('');
                    onBgValueChange('');
                  }
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.themeSection}>
        <span className={styles.themeSectionLabel}>Visual</span>
        <button
          className={`${styles.themePill} ${showVinyl ? styles.themePillActive : ''}`}
          onClick={() => onVinylToggle(!showVinyl)}
          style={{ flex: 'none', width: '100%', padding: '0.5rem' }}
        >
          {showVinyl ? '🎬 Change to: Video' : '🎵 Change to: Vinyl'}
        </button>
        {showVinyl && (
          <button
            className={`${styles.themePill} ${showMusicName ? styles.themePillActive : ''}`}
            onClick={() => onMusicNameToggle(!showMusicName)}
            style={{ flex: 'none', width: '100%', padding: '0.5rem' }}
          >
            {showMusicName ? '🎬 Show Video Name' : '🎵 Show Music Name'}
          </button>
        )}
      </div>

      <div className={styles.themeSection}>
        <span className={styles.themeSectionLabel}>Zen Background</span>
        <div className={styles.themePills}>
          <button
            className={`${styles.themePill} ${zenBgMode === 'dark' ? styles.themePillActive : ''}`}
            onClick={() => onZenBgChange('dark')}
          >
            Dark
          </button>
          <button
            className={`${styles.themePill} ${zenBgMode === 'transparent' ? styles.themePillActive : ''}`}
            onClick={() => onZenBgChange('transparent')}
          >
            Transparent
          </button>
        </div>
      </div>
    </div>
  );
}
