import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('useYouTube', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    window.YT = undefined;
    window.onYouTubeIframeAPIReady = undefined;
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('injects the youtube script tag if not present', async () => {
    const { useYouTube } = await import('./useYouTube');
    renderHook(() => useYouTube('test-container'));

    const scriptTag = document.querySelector('#yt-api-script');
    expect(scriptTag).not.toBeNull();
    expect(scriptTag.src).toBe('https://www.youtube.com/iframe_api');
  });

  it('does not inject duplicate script tags', async () => {
    const { useYouTube } = await import('./useYouTube');
    renderHook(() => useYouTube('test-container'));
    renderHook(() => useYouTube('test-container-2'));

    const scriptTags = document.querySelectorAll('#yt-api-script');
    expect(scriptTags.length).toBe(1);
  });

  it('initializes the player when API is ready', async () => {
    const { useYouTube } = await import('./useYouTube');
    const mockPlayer = {
      destroy: vi.fn(),
    };
    window.YT = {
      Player: vi.fn().mockImplementation(function (containerId, options) {
        setTimeout(() => {
          if (options.events && options.events.onReady) {
            options.events.onReady();
          }
        }, 0);
        return mockPlayer;
      }),
    };

    const { result, unmount } = renderHook(() => useYouTube('test-container'));

    expect(window.YT.Player).not.toHaveBeenCalled();

    act(() => {
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady();
      }
    });

    expect(window.YT.Player).toHaveBeenCalledWith('test-container', expect.any(Object));

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    unmount();
    expect(mockPlayer.destroy).toHaveBeenCalled();
  });

  it('provides player control functions', async () => {
    const { useYouTube } = await import('./useYouTube');
    const mockPlayer = {
      loadVideoById: vi.fn(),
      setVolume: vi.fn(),
      pauseVideo: vi.fn(),
      playVideo: vi.fn(),
      destroy: vi.fn(),
    };

    window.YT = {
      Player: vi.fn().mockImplementation(function () {
        return mockPlayer;
      }),
    };

    const { result } = renderHook(() => useYouTube('test-container'));

    act(() => {
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady();
      }
    });

    act(() => {
      result.current.loadVideo('test-id', 50);
    });
    expect(mockPlayer.loadVideoById).toHaveBeenCalledWith('test-id');

    act(() => {
      result.current.setVolume(75);
    });
    expect(mockPlayer.setVolume).toHaveBeenCalledWith(75);

    act(() => {
      result.current.pause();
    });
    expect(mockPlayer.pauseVideo).toHaveBeenCalled();

    act(() => {
      result.current.play();
    });
    expect(mockPlayer.playVideo).toHaveBeenCalled();
  });
});
