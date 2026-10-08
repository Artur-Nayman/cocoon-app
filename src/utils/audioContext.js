let ctx = null;
let isListening = false;

export function getAudioContext() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      ctx = new AudioContextClass();
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function resumeAudioContext() {
  if (ctx && ctx.state === 'suspended') {
    if (isListening) return; // Prevent stacking listeners

    const resume = () => {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      isListening = false;
      // Remove listeners once resumed
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
      document.removeEventListener('touchend', resume);
      document.removeEventListener('keydown', resume);
    };

    isListening = true;
    // Add one-time user interaction listeners
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
    document.addEventListener('touchend', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });

    // Try to resume immediately in case we already have user interaction
    ctx.resume().catch(() => {
        // Ignored, the event listeners will handle it
    });
  }
}
