import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value and handle set when localStorage is working', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('should handle inaccessible localStorage in hasKey gracefully', () => {
    // Mock getItem to throw an error, simulating inaccessible localStorage (e.g., SecurityError)
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });

    // We should fallback to initialValue
    const { result } = renderHook(() => useLocalStorage('test-key-error', 'fallback'));

    expect(result.current[0]).toBe('fallback');
    expect(getItemSpy).toHaveBeenCalledWith('test-key-error');
  });

  it('should seed value if key is not present and seed is provided', () => {
    const { result } = renderHook(() => useLocalStorage('test-seed-key', 'initial', 'seeded-val'));

    expect(result.current[0]).toBe('seeded-val');
    expect(localStorage.getItem('test-seed-key')).toBe(JSON.stringify('seeded-val'));
  });
});
