export function fadeVolume(audioEl, fromVol, toVol, duration = 500) {
  if (!audioEl) return Promise.resolve();
  const startTime = performance.now();
  return new Promise((resolve) => {
    function tick() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      audioEl.volume = fromVol + (toVol - fromVol) * eased;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }
    tick();
  });
}
