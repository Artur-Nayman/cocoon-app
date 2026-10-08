import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fadeVolume } from './fadeAudio';

describe('fadeVolume', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('performance', {
      now: vi.fn(),
    });
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => setTimeout(cb, 16)));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should resolve immediately if audioEl is falsy', async () => {
    const promise = fadeVolume(null, 0, 1);
    await expect(promise).resolves.toBeUndefined();
  });

  it('should fade volume from fromVol to toVol over the given duration', async () => {
    const audioEl = { volume: 0 };
    const duration = 500;

    // Set initial time
    performance.now.mockReturnValue(0);

    const promise = fadeVolume(audioEl, 0, 1, duration);

    // Initial check (tick has been called once synchronously)
    expect(audioEl.volume).toBe(0);

    // Advance halfway (250ms)
    performance.now.mockReturnValue(250);
    vi.advanceTimersByTime(16); // Trigger the next RAF

    // At halfway (progress = 0.5), eased = 1 - Math.pow(1 - 0.5, 3) = 1 - 0.125 = 0.875
    // Volume should be 0 + (1 - 0) * 0.875 = 0.875
    expect(audioEl.volume).toBeCloseTo(0.875);

    // Advance to end (500ms)
    performance.now.mockReturnValue(500);
    vi.advanceTimersByTime(16); // Trigger the final RAF

    // At end (progress = 1), eased = 1 - Math.pow(0, 3) = 1
    // Volume should be 1
    expect(audioEl.volume).toBe(1);

    await expect(promise).resolves.toBeUndefined();
  });

  it('should cap progress at 1 even if time exceeds duration', async () => {
    const audioEl = { volume: 0.5 };
    const duration = 1000;

    performance.now.mockReturnValue(0);
    const promise = fadeVolume(audioEl, 0.5, 0, duration);

    // Advance time past duration (1500ms)
    performance.now.mockReturnValue(1500);
    vi.advanceTimersByTime(16);

    // Volume should be fully faded to 0 (cap at 1)
    expect(audioEl.volume).toBe(0);

    await expect(promise).resolves.toBeUndefined();
  });

  it('should use default duration of 500ms if not provided', async () => {
    const audioEl = { volume: 0 };

    performance.now.mockReturnValue(0);
    const promise = fadeVolume(audioEl, 0, 1); // no duration provided

    // Advance time to 500ms
    performance.now.mockReturnValue(500);
    vi.advanceTimersByTime(16);

    expect(audioEl.volume).toBe(1);

    await expect(promise).resolves.toBeUndefined();
  });
});
