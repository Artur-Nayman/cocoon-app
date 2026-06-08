import { useEffect, useRef, useCallback } from 'react';
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

  const color = CHANNEL_COLORS[category] || CHANNEL_COLORS.custom;
  const isActive = playing !== false;
  const showSeek = duration > 0;

  return (
    <div className={`${styles.card} ${isActive ? styles.active : ''}`} style={{ '--channel-color': color }}>
      <button className={styles.toggleBtn} onClick={() => onToggle(id)} style={{ background: isActive ? color : 'transparent' }}>
        <span className={styles.icon}>{CHANNEL_ICONS[category] || '🔊'}</span>
      </button>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <input className={styles.slider} type="range" min="0" max="100" value={volume ?? 50} onChange={(e) => onVolume(id, Number(e.target.value))} />
        {showSeek && (
          <div className={styles.seekRow}>
            <span className={styles.seekTime}>{formatTime(currentTime)}</span>
            <input className={styles.seekSlider} type="range" min="0" max={duration || 0} step="0.1" value={currentTime} onChange={handleSeek} />
            <span className={styles.seekTime}>{formatTime(duration)}</span>
            <button className={styles.randomBtn} onClick={handleRandom} title="Jump to random position">🎲</button>
          </div>
        )}
      </div>
      <button className={styles.removeBtn} onClick={() => onRemove(id)}>✕</button>
    </div>
  );
}
