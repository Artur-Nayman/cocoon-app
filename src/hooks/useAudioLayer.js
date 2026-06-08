import { useRef, useCallback, useEffect } from 'react';
import { getAudioContext } from '../utils/audioContext';
import { fadeVolume } from '../utils/fadeAudio';

let hlsModule = null;
let hlsPromise = null;

async function ensureHls() {
  if (hlsModule) return hlsModule;
  if (!hlsPromise) {
    hlsPromise = import('hls.js').then((mod) => {
      hlsModule = mod.default;
      return hlsModule;
    });
  }
  return hlsPromise;
}

export function useAudioLayer() {
  const elRef = useRef(null);
  const hlsRef = useRef(null);
  const pendingRef = useRef(null);
  const volumeRef = useRef(0.5);

  const ensureSource = useCallback(() => {
    if (elRef.current) return;
    const el = document.createElement('audio');
    elRef.current = el;
  }, []);

  const tryPlay = useCallback((el) => {
    if (!el) return;
    el.play().catch((err) => {
      console.warn('[useAudioLayer] play() rejected:', err.message);
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => el.play()).catch((e2) => {
          console.warn('[useAudioLayer] retry after resume failed:', e2.message);
        });
      }
    });
  }, []);

  const load = useCallback(async (url, volume, fadeMs = 0) => {
    ensureSource();
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const el = elRef.current;
    if (!el) return;
    pendingRef.current = null;
    volumeRef.current = volume;

    if (fadeMs > 0 && !el.paused) {
      await fadeVolume(el, el.volume, 0, fadeMs / 2);
    }

    el.pause();
    el.src = '';
    el.loop = false;

    const isHls = url.includes('.m3u8') || url.includes('m3u8');

    if (isHls) {
      const Hls = await ensureHls();
      if (Hls && Hls.isSupported()) {
        el.loop = false;
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(el);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          el.volume = 0;
          tryPlay(el);
          if (fadeMs > 0) {
            fadeVolume(el, 0, volume, fadeMs);
          } else {
            el.volume = volume;
          }
        });
        return;
      }
    }

    el.loop = true;
    el.volume = 0;
    el.src = url;

    pendingRef.current = { el, url, volume };

    el.addEventListener('error', () => {
      console.warn('[useAudioLayer] media error:', el.error ? `code=${el.error.code} message=${el.error.message}` : 'unknown');
    }, { once: true });

    const playIt = () => {
      el.volume = 0;
      tryPlay(el);
      if (fadeMs > 0) {
        fadeVolume(el, 0, volumeRef.current, fadeMs);
      } else {
        el.volume = volumeRef.current;
      }
    };

    if (el.readyState >= 2) {
      playIt();
    } else {
      el.addEventListener('canplay', playIt, { once: true });
      el.load();
    }
  }, [ensureSource, tryPlay]);

  const setVolume = useCallback((vol) => {
    volumeRef.current = vol;
    if (elRef.current) elRef.current.volume = vol;
  }, []);

  const fadeOutAndPause = useCallback(async (fadeMs = 0) => {
    pendingRef.current = null;
    const el = elRef.current;
    if (!el) return;
    if (fadeMs > 0 && !el.paused) {
      await fadeVolume(el, el.volume, 0, fadeMs);
    }
    el.pause();
  }, []);

  const fadeInResume = useCallback(async (fadeMs = 0) => {
    const el = elRef.current;
    if (!el) return;
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
    pendingRef.current = null;
    if (elRef.current) elRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    if (elRef.current) {
      elRef.current.volume = volumeRef.current;
      tryPlay(elRef.current);
    }
  }, [tryPlay]);

  useEffect(() => {
    const handler = () => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') return;
      if (pendingRef.current && elRef.current && elRef.current.paused) {
        tryPlay(elRef.current);
      }
    };
    document.addEventListener('click', handler, { once: false });
    return () => document.removeEventListener('click', handler);
  }, [tryPlay]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (elRef.current) {
        elRef.current.pause();
        elRef.current.src = '';
      }
      elRef.current = null;
      pendingRef.current = null;
    };
  }, []);

  return { load, setVolume, pause, resume, fadeOutAndPause, fadeInResume };
}
