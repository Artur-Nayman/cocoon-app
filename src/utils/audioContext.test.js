import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('audioContext', () => {
  let resumeMock;

  beforeEach(() => {
    resumeMock = vi.fn();
    globalThis.AudioContext = class {
      constructor() {
        this.state = 'suspended';
        this.resume = resumeMock;
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('resumeAudioContext', () => {
    it('should not throw if context is not initialized', async () => {
      // we need to run resumeAudioContext without calling getAudioContext first
      const module = await import('./audioContext.js');
      expect(() => module.resumeAudioContext()).not.toThrow();
    });

    it('should call resume if state is suspended', async () => {
      const module = await import('./audioContext.js');
      module.getAudioContext();

      module.resumeAudioContext();

      expect(resumeMock).toHaveBeenCalledTimes(2); // once in getAudioContext, once in resumeAudioContext
    });

    it('should not call resume if state is running', async () => {
      const module = await import('./audioContext.js');

      const ctx = module.getAudioContext();
      expect(resumeMock).toHaveBeenCalledTimes(1); // getAudioContext calls it because state is 'suspended' in mock initially

      // change state to running
      ctx.state = 'running';

      module.resumeAudioContext();

      expect(resumeMock).toHaveBeenCalledTimes(1); // Should not increase
    });
  });
});
