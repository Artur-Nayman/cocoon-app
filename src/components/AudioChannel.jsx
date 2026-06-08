import { useEffect, useRef } from 'react';
import { useAudioLayer } from '../hooks/useAudioLayer';
import { BACKEND_URL } from '../config';

export default function AudioChannel({ url, volume, type, playing, onBackendStatus, fadeMs = 500 }) {
  const { load, setVolume, fadeOutAndPause, fadeInResume } = useAudioLayer();
  const loadedKey = useRef(null);
  const prevVol = useRef(null);

  useEffect(() => {
    if (!url) {
      loadedKey.current = null;
      return;
    }

    const key = `${url}|${type}`;

    if (type === 'youtube') {
      if (key === loadedKey.current) return;
      loadedKey.current = key;
      prevVol.current = volume;

      fetch(`${BACKEND_URL}/api/audio/extract?url=${encodeURIComponent(url)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.audioUrl) {
            load(data.audioUrl, volume, fadeMs);
          } else {
            console.warn('AudioChannel: API returned no audio URL for', url);
            if (onBackendStatus) onBackendStatus('down');
          }
        })
        .catch(() => {
          console.warn('AudioChannel: backend unavailable');
          if (onBackendStatus) onBackendStatus('down');
        });
    } else {
      if (key === loadedKey.current) return;
      loadedKey.current = key;
      prevVol.current = volume;
      load(url, volume, fadeMs);
    }
  }, [url, volume, type, load, fadeMs, onBackendStatus]);

  useEffect(() => {
    if (volume !== prevVol.current && loadedKey.current) {
      setVolume(volume);
      prevVol.current = volume;
    }
  }, [volume, setVolume]);

  useEffect(() => {
    if (playing === false) fadeOutAndPause(fadeMs);
    else if (playing === true) fadeInResume(fadeMs);
  }, [playing, fadeOutAndPause, fadeInResume, fadeMs]);

  useEffect(() => {
    return () => { loadedKey.current = null; };
  }, []);

  return null;
}
