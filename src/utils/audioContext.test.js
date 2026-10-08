import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('audioContext', () => {
  let resumeMock;

  beforeEach(() => {
    resumeMock = vi.fn();
    class MockAudioContext {
      constructor() {
        this.state = 'running';
        this.resume = resumeMock;
      }
    }
    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('should create a new AudioContext if one does not exist', async () => {
    const { getAudioContext } = await import('./audioContext');
    const ctx = getAudioContext();
    expect(ctx).toBeDefined();
    expect(ctx.state).toBe('running');
  });

  it('should reuse the existing AudioContext on subsequent calls', async () => {
    const { getAudioContext } = await import('./audioContext');
    const ctx1 = getAudioContext();
    const ctx2 = getAudioContext();
    expect(ctx1).toBe(ctx2);
  });

  it('should call resume if the context state is suspended', async () => {
    class MockSuspendedAudioContext {
      constructor() {
        this.state = 'suspended';
        this.resume = resumeMock;
      }
    }
    vi.stubGlobal('AudioContext', MockSuspendedAudioContext);

    const { getAudioContext } = await import('./audioContext');
    const ctx = getAudioContext();
    expect(resumeMock).toHaveBeenCalledTimes(1);
    expect(ctx.state).toBe('suspended');
  });

  it('should not call resume if the context state is running', async () => {
    const { getAudioContext } = await import('./audioContext');
    const ctx = getAudioContext();
    expect(resumeMock).not.toHaveBeenCalled();
    expect(ctx.state).toBe('running');
  });

  it('resumeAudioContext should call resume if ctx exists and is suspended', async () => {
    class MockSuspendedAudioContext {
      constructor() {
        this.state = 'suspended';
        this.resume = resumeMock;
      }
    }
    vi.stubGlobal('AudioContext', MockSuspendedAudioContext);

    const { getAudioContext, resumeAudioContext } = await import('./audioContext');
    getAudioContext(); // creates ctx, state is 'suspended', calls resume
    resumeMock.mockClear();

    resumeAudioContext();
    expect(resumeMock).toHaveBeenCalledTimes(1);
  });

  it('resumeAudioContext should not call resume if ctx does not exist', async () => {
    const { resumeAudioContext } = await import('./audioContext');
    resumeAudioContext();
    expect(resumeMock).not.toHaveBeenCalled();
  });

  it('resumeAudioContext should not call resume if ctx is not suspended', async () => {
    const { getAudioContext, resumeAudioContext } = await import('./audioContext');
    getAudioContext(); // state 'running', resume not called
    resumeMock.mockClear();

    resumeAudioContext();
    expect(resumeMock).not.toHaveBeenCalled();
  });
});
