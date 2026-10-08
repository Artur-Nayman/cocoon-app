import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSleepTimer } from '../useSleepTimer';

describe('useSleepTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSleepTimer(vi.fn()));

    expect(result.current.sleepMinutes).toBe(0);
    expect(result.current.remaining).toBe(0);
    expect(result.current.label).toBe('');
  });

  it('should start the timer correctly', () => {
    const { result } = renderHook(() => useSleepTimer(vi.fn()));

    act(() => {
      result.current.start(5);
    });

    expect(result.current.sleepMinutes).toBe(5);
    expect(result.current.remaining).toBe(300);
    expect(result.current.label).toBe('5:00');
  });

  it('should decrement remaining time correctly and update label', () => {
    const { result } = renderHook(() => useSleepTimer(vi.fn()));

    act(() => {
      result.current.start(5); // 300 seconds
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remaining).toBe(299);
    expect(result.current.label).toBe('4:59');

    act(() => {
      vi.advanceTimersByTime(60000); // 1 minute
    });

    expect(result.current.remaining).toBe(239);
    expect(result.current.label).toBe('3:59');
  });

  it('should call onTimerEnd and stop when timer reaches 0', () => {
    const onTimerEnd = vi.fn();
    const { result } = renderHook(() => useSleepTimer(onTimerEnd));

    act(() => {
      result.current.start(1); // 60 seconds
    });

    act(() => {
      vi.advanceTimersByTime(59000);
    });

    expect(result.current.remaining).toBe(1);
    expect(onTimerEnd).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remaining).toBe(0);
    expect(result.current.sleepMinutes).toBe(0);
    expect(result.current.label).toBe('');
    expect(onTimerEnd).toHaveBeenCalledTimes(1);
  });

  it('should stop the timer correctly', () => {
    const { result } = renderHook(() => useSleepTimer(vi.fn()));

    act(() => {
      result.current.start(5);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remaining).toBe(299);

    act(() => {
      result.current.stop();
    });

    expect(result.current.sleepMinutes).toBe(0);
    expect(result.current.remaining).toBe(0);
    expect(result.current.label).toBe('');

    // Ensure timer doesn't continue ticking
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remaining).toBe(0);
  });

  it('should toggle the timer correctly', () => {
    const { result } = renderHook(() => useSleepTimer(vi.fn()));

    // Toggle on
    act(() => {
      result.current.toggle(10);
    });

    expect(result.current.sleepMinutes).toBe(10);
    expect(result.current.remaining).toBe(600);

    // Toggle off (passing the same minutes should stop it)
    act(() => {
      result.current.toggle(10);
    });

    expect(result.current.sleepMinutes).toBe(0);
    expect(result.current.remaining).toBe(0);

    // Toggle to a different time
    act(() => {
      result.current.toggle(5);
    });

    expect(result.current.sleepMinutes).toBe(5);
    expect(result.current.remaining).toBe(300);

    act(() => {
      result.current.toggle(15);
    });

    expect(result.current.sleepMinutes).toBe(15);
    expect(result.current.remaining).toBe(900);
  });

  it('should clear interval on unmount', () => {
    const { result, unmount } = renderHook(() => useSleepTimer(vi.fn()));

    act(() => {
      result.current.start(5);
    });

    expect(result.current.remaining).toBe(300);

    unmount();

    // Advance time after unmount to ensure interval is cleared
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // The state inside the hook shouldn't update, but more importantly, no React state update warning or error should occur
    // since the interval is cleared.
  });
});
