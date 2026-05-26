import { useEffect, useRef } from 'react';
import { useAudioLayer } from '../hooks/useAudioLayer';

export default function MelodicLayer({ url, volume, type, playing, onBackendStatus }) {
  const { load, setVolume, pause, resume } = useAudioLayer();
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

      fetch(`/api/audio/extract?url=${encodeURIComponent(url)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.audioUrl) {
            load(data.audioUrl, volume);
          } else {
            console.warn('MelodicLayer: API returned no audio URL for', url);
            if (onBackendStatus) onBackendStatus('down');
          }
        })
        .catch(() => {
          console.warn('MelodicLayer: backend unavailable — start the server with `cd server && npm start`');
          if (onBackendStatus) onBackendStatus('down');
        });
    } else {
      if (key === loadedKey.current) return;
      loadedKey.current = key;
      prevVol.current = volume;
      load(url, volume);
    }
  }, [url, volume, type, load, onBackendStatus]);

  useEffect(() => {
    if (volume !== prevVol.current && loadedKey.current) {
      setVolume(volume);
      prevVol.current = volume;
    }
  }, [volume, setVolume]);

  useEffect(() => {
    if (playing === false) pause();
    else if (playing === true) resume();
  }, [playing, pause, resume]);

  useEffect(() => {
    return () => { loadedKey.current = null; };
  }, []);

  return null;
}
