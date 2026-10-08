import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useAudioLayer } from './useAudioLayer';

// Mock dependencies
vi.mock('../utils/audioContext', () => ({
  getAudioContext: vi.fn(() => ({
    state: 'running',
    resume: vi.fn().mockResolvedValue(),
  })),
}));

vi.mock('../utils/fadeAudio', () => ({
  fadeVolume: vi.fn().mockResolvedValue(),
}));

// Mock Audio globally
const mockAudioPrototype = {
  play: vi.fn().mockResolvedValue(),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

class MockAudio {
  constructor() {
    Object.assign(this, { ...mockAudioPrototype, src: '', volume: 1, currentTime: 0, duration: 100, paused: true, loop: false });
  }
}
globalThis.Audio = MockAudio;

// Since document.createElement('audio') is used inside the hook, we must mock it as well
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName) => {
  if (tagName === 'audio') {
    return new globalThis.Audio();
  }
  return originalCreateElement(tagName);
});

describe('useAudioLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should create audio element and load source correctly', async () => {
    const { result } = renderHook(() => useAudioLayer());
    const mockAudioInstances = [];
    document.createElement.mockImplementationOnce(() => {
      const instance = new globalThis.Audio();
      mockAudioInstances.push(instance);
      return instance;
    });

    await act(async () => {
      await result.current.load('test.mp3', 0.8, 0);
    });

    expect(document.createElement).toHaveBeenCalledWith('audio');
    expect(mockAudioInstances.length).toBe(1);

    const el = mockAudioInstances[0];
    expect(el.src).toBe('test.mp3');
    expect(el.volume).toBe(0); // initial load sets to 0 (faded down), tryPlay/fade will be used
    expect(el.loop).toBe(true);
    expect(el.load).toHaveBeenCalled();
  });

  it('should update volume correctly', async () => {
    const { result } = renderHook(() => useAudioLayer());
    const mockAudioInstances = [];
    document.createElement.mockImplementationOnce(() => {
      const instance = new globalThis.Audio();
      mockAudioInstances.push(instance);
      return instance;
    });

    await act(async () => {
      await result.current.load('test.mp3', 0.8, 0);
    });

    const el = mockAudioInstances[0];

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(el.volume).toBe(0.5);
  });

  it('should seek to time correctly', async () => {
    const { result } = renderHook(() => useAudioLayer());
    const mockAudioInstances = [];
    document.createElement.mockImplementationOnce(() => {
      const instance = new globalThis.Audio();
      mockAudioInstances.push(instance);
      return instance;
    });

    await act(async () => {
      await result.current.load('test.mp3', 0.8, 0);
    });

    const el = mockAudioInstances[0];

    act(() => {
      result.current.seek(15);
    });

    expect(el.currentTime).toBe(15);
    expect(result.current.currentTime).toBe(15);
  });

  it('should pause and resume correctly', async () => {
    const { result } = renderHook(() => useAudioLayer());
    let canPlayCallback;
    const mockAudioInstances = [];
    document.createElement.mockImplementationOnce(() => {
      const instance = new globalThis.Audio();
      instance.addEventListener = vi.fn((event, cb) => {
        if (event === 'canplay') {
          canPlayCallback = cb;
        }
      });
      mockAudioInstances.push(instance);
      return instance;
    });

    await act(async () => {
      await result.current.load('test.mp3', 0.8, 0);
    });

    const el = mockAudioInstances[0];

    act(() => {
      result.current.pause();
    });
    expect(el.pause).toHaveBeenCalled();

    act(() => {
      result.current.resume();
    });
    // tryPlay bails out because readyRef is not true yet
    expect(el.play).not.toHaveBeenCalled();

    // Trigger canplay to set readyRef to true
    act(() => {
      if (canPlayCallback) {
        canPlayCallback();
      }
    });

    act(() => {
      result.current.resume();
    });
    expect(el.volume).toBe(0.8);
    expect(el.play).toHaveBeenCalled();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioLayer());

    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBe(0);
    expect(typeof result.current.load).toBe('function');
    expect(typeof result.current.setVolume).toBe('function');
    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.resume).toBe('function');
    expect(typeof result.current.seek).toBe('function');
    expect(typeof result.current.fadeOutAndPause).toBe('function');
    expect(typeof result.current.fadeInResume).toBe('function');
  });
});
