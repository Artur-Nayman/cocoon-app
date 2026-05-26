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
  const sourceRef = useRef(null);
  const gainRef = useRef(null);
  const hlsRef = useRef(null);
  const initDone = useRef(false);
  const pendingRef = useRef(null);

  const ensureSource = useCallback(() => {
    if (sourceRef.current) return;
    const ctx = getAudioContext();
    const el = document.createElement('audio');
    el.crossOrigin = 'anonymous';
    elRef.current = el;

    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    gain.connect(ctx.destination);
    gainRef.current = gain;
  }, []);

  const connectMediaElement = useCallback(() => {
    if (sourceRef.current) return;
    const ctx = getAudioContext();
    const el = elRef.current;
    if (!el) return;
    try {
      const source = ctx.createMediaElementSource(el);
      source.connect(gainRef.current);
      sourceRef.current = source;
    } catch {
      // already connected
    }
  }, []);

  const tryPlay = useCallback((el) => {
    if (!el) return;
    el.play().catch(() => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => el.play()).catch(() => {});
      }
    });
  }, []);

  const load = useCallback(async (url, volume) => {
    ensureSource();
    if (!initDone.current) {
      connectMediaElement();
      initDone.current = true;
    }

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
          if (gainRef.current) gainRef.current.gain.value = volume;
          tryPlay(el);
        });
        return;
      }
    }

    el.loop = true;
    el.src = url;
    el.volume = 1;
    if (gainRef.current) gainRef.current.gain.value = volume;
    pendingRef.current = { el, url, volume };
    tryPlay(el);
  }, [ensureSource, connectMediaElement, tryPlay]);

  const setVolume = useCallback((vol) => {
    if (gainRef.current) gainRef.current.gain.value = vol;
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
      sourceRef.current = null;
      gainRef.current = null;
      initDone.current = false;
      pendingRef.current = null;
    };
  }, []);

  return { load, setVolume, pause, resume };
}
