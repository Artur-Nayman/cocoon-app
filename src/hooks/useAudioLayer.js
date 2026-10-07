import { useRef, useCallback, useEffect, useState } from 'react';
import { getAudioContext } from '../utils/audioContext';
import { fadeVolume } from '../utils/fadeAudio';

export function useAudioLayer() {
  const elRef = useRef(null);
  const volumeRef = useRef(0.5);
  const readyRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const setupListeners = useCallback((el) => {
    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onMeta = () => setDuration(el.duration || 0);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('durationchange', onMeta);
  }, []);

  const ensureSource = useCallback(() => {
    if (elRef.current) return;
    const el = document.createElement('audio');
    elRef.current = el;
    setupListeners(el);
  }, [setupListeners]);

  const tryPlay = useCallback((el) => {
    if (!el) return;
    console.log('[useAudioLayer] tryPlay, readyRef:', readyRef.current, 'src:', el.src ? el.src.substring(0, 60) + '...' : 'none');
    el.play().then(() => {
      console.log('[useAudioLayer] play() resolved OK');
    }).catch((err) => {
      console.warn('[useAudioLayer] play() rejected:', err.message);
      const ctx = getAudioContext();
      console.log('[useAudioLayer] AudioContext state:', ctx.state);
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => el.play()).then(() => {
          console.log('[useAudioLayer] play() after resume OK');
        }).catch((e2) => {
          console.warn('[useAudioLayer] retry after resume failed:', e2.message);
        });
      }
    });
  }, []);

  const load = useCallback(async (url, volume, fadeMs = 0) => {
    ensureSource();
    const el = elRef.current;
    if (!el) return;
    console.log('[useAudioLayer] load:', url.substring(0, 80) + '...', 'vol:', volume);
    readyRef.current = false;
    volumeRef.current = volume;

    if (fadeMs > 0 && !el.paused) {
      await fadeVolume(el, el.volume, 0, fadeMs / 2);
    }

    el.pause();
    el.src = '';
    el.loop = false;
    setCurrentTime(0);
    setDuration(0);

    el.loop = true;
    el.volume = 0;
    el.src = url;

    el.addEventListener('error', () => {
      console.warn('[useAudioLayer] media error:', el.error ? `code=${el.error.code} message=${el.error.message}` : 'unknown');
    }, { once: true });

    const markReady = () => {
      console.log('[useAudioLayer] canplay fired, ready');
      readyRef.current = true;
    };
    el.addEventListener('canplay', markReady, { once: true });
    el.addEventListener('loadedmetadata', () => setDuration(el.duration || 0), { once: true });
    el.load();

    setDuration(el.duration || 0);
  }, [ensureSource]);

  const setVolume = useCallback((vol) => {
    volumeRef.current = vol;
    if (elRef.current) elRef.current.volume = vol;
  }, []);

  const seek = useCallback((time) => {
    if (elRef.current) {
      elRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const fadeOutAndPause = useCallback(async (fadeMs = 0) => {
    const el = elRef.current;
    if (!el) return;
    if (fadeMs > 0 && !el.paused) {
      await fadeVolume(el, el.volume, 0, fadeMs);
    }
    el.pause();
  }, []);

  const fadeInResume = useCallback(async (fadeMs = 0) => {
    const el = elRef.current;
    console.log('[useAudioLayer] fadeInResume, readyRef:', readyRef.current, 'fadeMs:', fadeMs);
    if (!el || !readyRef.current) {
      console.warn('[useAudioLayer] fadeInResume BAILED: el=', !!el, 'ready=', !!readyRef.current);
      return;
    }
    if (fadeMs > 0) {
      el.volume = 0;
      tryPlay(el);
      fadeVolume(el, 0, volumeRef.current, fadeMs);
    } else {
      el.volume = volumeRef.current;
      tryPlay(el);
    }
  }, [tryPlay]);

  const pause = useCallback(() => {
    if (elRef.current) elRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    const el = elRef.current;
    if (!el || !readyRef.current) return;
    el.volume = volumeRef.current;
    tryPlay(el);
  }, [tryPlay]);

  useEffect(() => {
    return () => {
      if (elRef.current) {
        elRef.current.pause();
        elRef.current.src = '';
      }
      elRef.current = null;
    };
  }, []);

  return { load, setVolume, pause, resume, seek, currentTime, duration, fadeOutAndPause, fadeInResume };
}
