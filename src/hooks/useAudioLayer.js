import { useRef, useCallback, useEffect } from 'react';
import { getAudioContext } from '../utils/audioContext';

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

  const ensureSource = useCallback(() => {
    if (elRef.current) return;
    const el = document.createElement('audio');
    elRef.current = el;
  }, []);

  const tryPlay = useCallback((el) => {
    if (!el) return;
    el.play().catch((err) => {
      console.warn('[useAudioLayer] play() rejected:', err.message, 'readyState:', el.readyState, 'networkState:', el.networkState);
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => el.play()).catch((e2) => {
          console.warn('[useAudioLayer] retry after resume failed:', e2.message);
        });
      }
    });
  }, []);

  const load = useCallback(async (url, volume) => {
    ensureSource();
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const el = elRef.current;
    if (!el) return;
    pendingRef.current = null;

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
          el.volume = volume;
          tryPlay(el);
        });
        return;
      }
    }

    el.loop = true;
    el.src = url;
    el.volume = volume;
    pendingRef.current = { el, url, volume };
    el.addEventListener('error', () => {
      console.warn('[useAudioLayer] media error:', el.error ? `code=${el.error.code} message=${el.error.message}` : 'unknown');
    }, { once: true });
    el.addEventListener('canplay', () => {
      console.log('[useAudioLayer] media canplay');
    }, { once: true });
    el.addEventListener('loadstart', () => {
      console.log('[useAudioLayer] loadstart', url.slice(0, 60));
    }, { once: true });
    tryPlay(el);
  }, [ensureSource, tryPlay]);

  const setVolume = useCallback((vol) => {
    if (elRef.current) elRef.current.volume = vol;
  }, []);

  const pause = useCallback(() => {
    pendingRef.current = null;
    if (elRef.current) elRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    if (elRef.current) tryPlay(elRef.current);
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

  return { load, setVolume, pause, resume };
}
