import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioLayer } from '../hooks/useAudioLayer';
import { BACKEND_URL } from '../config';
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

function formatTime(s) {
  if (s == null || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function ChannelCard({ channel, masterVolume, onToggle, onVolume, onRemove, onBackendStatus }) {
  const { load, setVolume, fadeOutAndPause, fadeInResume, seek, currentTime, duration } = useAudioLayer();
  const loadedKey = useRef(null);
  const prevVol = useRef(null);
  const seekingRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const pillRef = useRef(null);

  const { id, url, volume, type, name, category, playing } = channel;
  const vol = volume != null ? volume * masterVolume / 10000 : 0;

  useEffect(() => {
    if (!url) {
      loadedKey.current = null;
      return;
    }
    const key = `${url}|${type}`;
    if (key === loadedKey.current) return;
    loadedKey.current = key;
    prevVol.current = volume;

    const doLoad = (audioUrl) => {
      load(audioUrl, vol, 500);
    };

    if (type === 'youtube') {
      fetch(`${BACKEND_URL}/api/audio/extract?url=${encodeURIComponent(url)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.audioUrl) doLoad(data.audioUrl);
          else { if (onBackendStatus) onBackendStatus('down'); }
        })
        .catch(() => { if (onBackendStatus) onBackendStatus('down'); });
    } else {
      doLoad(url);
    }
  }, [url, type, load, vol, onBackendStatus, volume]);

  useEffect(() => {
    if (volume !== prevVol.current && loadedKey.current) {
      setVolume(vol);
      prevVol.current = volume;
    }
  }, [volume, vol, setVolume]);

  useEffect(() => {
    if (playing === false) fadeOutAndPause(500);
    else if (playing === true) fadeInResume(500);
  }, [playing, fadeOutAndPause, fadeInResume]);

  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      const newVol = Math.max(0, Math.min(100, (volume ?? 50) + delta));
      onVolume(id, newVol);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [id, volume, onVolume]);

  const handleSeek = useCallback((e) => {
    const t = Number(e.target.value);
    seekingRef.current = true;
    seek(t);
    requestAnimationFrame(() => { seekingRef.current = false; });
  }, [seek]);

  const handleRandom = useCallback(() => {
    if (duration > 0) {
      const t = Math.random() * duration;
      seek(t);
    }
  }, [duration, seek]);

  const handleClick = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  const handleContext = useCallback((e) => {
    e.preventDefault();
    onRemove(id);
  }, [id, onRemove]);

  const color = CHANNEL_COLORS[category] || CHANNEL_COLORS.custom;
  const isActive = playing !== false;
  const showSeek = duration > 0;
  const pct = volume ?? 50;
  const perimeter = 118;
  const dashLen = (pct / 100) * perimeter;
  const borderW = 1 + (pct / 100) * 2.5;

  return (
    <div
      className={`${styles.card} ${isActive ? styles.cardActive : ''} ${expanded ? styles.expanded : ''}`}
      style={{ '--channel-color': color }}
    >
      <div className={styles.pill} ref={pillRef} onClick={handleClick} onContextMenu={handleContext}>
        <div className={styles.iconBox}>
          <svg className={styles.volumeSvg} viewBox="0 0 40 40" width="36" height="36">
            <rect
              x="3" y="3" width="34" height="34" rx="8"
              fill={isActive ? color : 'transparent'}
              fillOpacity={isActive ? 0.25 : 0}
              stroke={color}
              strokeWidth={borderW}
              strokeDasharray={`${dashLen} ${perimeter}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.15s, stroke-width 0.15s' }}
            />
          </svg>
          <span className={styles.icon}>{CHANNEL_ICONS[category] || '🔊'}</span>
        </div>
        <span className={styles.name}>{name}</span>
      </div>

      {expanded && (
        <div className={styles.detail} onClick={(e) => e.stopPropagation()}>
          <div className={styles.detailRow}>
            <button
              className={styles.playBtn}
              onClick={() => onToggle(id)}
              title={playing ? 'Pause' : 'Play'}
            >{playing ? '⏸' : '▶️'}</button>
            <input
              className={styles.detailSlider}
              type="range" min="0" max="100"
              value={pct}
              onChange={(e) => onVolume(id, Number(e.target.value))}
            />
            <span className={styles.detailVol}>{pct}%</span>
            <button className={styles.detailAction} onClick={handleRandom} title="Random position">🎲</button>
          </div>
          {showSeek && (
            <div className={styles.detailRow}>
              <input
                className={styles.seekSlider}
                type="range" min="0" max={duration || 0} step="0.1"
                value={currentTime}
                onChange={handleSeek}
              />
              <span className={styles.seekTime}>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          )}
          <button
            className={styles.deleteBtn}
            onClick={() => onRemove(id)}
          >✕ Remove</button>
        </div>
      )}
    </div>
  );
}
