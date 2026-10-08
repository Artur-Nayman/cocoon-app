import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value if no value exists in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return seeded value if seedValue provided and no value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial', 'seeded'));
    expect(result.current[0]).toBe('seeded');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('seeded'));
  });

  it('should return existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('existing'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('existing');
  });

  it('should update localStorage when setter is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('should update localStorage when setter is called with function', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 5));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(10);
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify(10));
  });

  it('should handle localStorage inaccessible error gracefully in hasKey', () => {
    // We want to test the `catch` block inside `hasKey`
    // function hasKey(key) {
    //   try {
    //     return localStorage.getItem(key) !== null;
    //   } catch {
    //     return false;
    //   }
    // }
    // hasKey is called in the useState initializer if seedValue is provided:
    // if (!hasKey(key) && seedValue !== undefined)

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    // This will hit hasKey during state initialization.
    // hasKey will catch the error and return false.
    // It will then attempt to setItem with the seedValue.
    const { result } = renderHook(() => useLocalStorage('inaccessible-key', 'initial', 'seeded'));

    expect(getItemSpy).toHaveBeenCalledWith('inaccessible-key');
    expect(setItemSpy).toHaveBeenCalledWith('inaccessible-key', JSON.stringify('seeded'));
    expect(result.current[0]).toBe('seeded');
  });
});
