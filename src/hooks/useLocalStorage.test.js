import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('useLocalStorage hook', () => {
  let getItemMock;
  let setItemMock;
  let removeItemMock;

  beforeEach(() => {
    getItemMock = vi.fn().mockReturnValue(null);
    setItemMock = vi.fn();
    removeItemMock = vi.fn();

    const localStorageMock = {
      getItem: getItemMock,
      setItem: setItemMock,
      removeItem: removeItemMock,
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };

    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initialValue when there is no value in localStorage and no seedValue is provided', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
    expect(result.current[0]).toBe('initial');
    expect(getItemMock).toHaveBeenCalledWith('testKey');
    // It should check hasKey once (which calls getItem), and then calls getItem again to retrieve it
    expect(getItemMock).toHaveBeenCalledTimes(2);
    expect(setItemMock).not.toHaveBeenCalled();
  });

  it('should return parsed value from localStorage when a value exists', () => {
    getItemMock.mockReturnValue(JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
    expect(result.current[0]).toBe('stored');
    expect(getItemMock).toHaveBeenCalledWith('testKey');
    expect(setItemMock).not.toHaveBeenCalled();
  });

  it('should seed value to localStorage when no value exists and seedValue is provided', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial', 'seeded'));
    expect(result.current[0]).toBe('seeded');
    expect(setItemMock).toHaveBeenCalledWith('testKey', JSON.stringify('seeded'));
  });

  it('should execute seedValue function and save to localStorage when provided', () => {
    const seedFunc = vi.fn().mockReturnValue('seeded from func');
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial', seedFunc));

    expect(seedFunc).toHaveBeenCalled();
    expect(result.current[0]).toBe('seeded from func');
    expect(setItemMock).toHaveBeenCalledWith('testKey', JSON.stringify('seeded from func'));
  });

  it('should not seed value when a value already exists in localStorage', () => {
    getItemMock.mockReturnValue(JSON.stringify('already exists'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial', 'seeded'));

    expect(result.current[0]).toBe('already exists');
    expect(setItemMock).not.toHaveBeenCalled();
  });

  it('should handle localStorage exception by returning initialValue', () => {
    getItemMock.mockImplementation(() => {
      throw new Error('localStorage is disabled');
    });
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should handle JSON parse error by returning initialValue', () => {
    getItemMock.mockReturnValue('invalid json');
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('setValue should update state and write to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(setItemMock).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });

  it('setValue should support functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 5));

    expect(result.current[0]).toBe(5);

    act(() => {
      result.current[1]((prev) => prev + 10);
    });

    expect(result.current[0]).toBe(15);
    expect(setItemMock).toHaveBeenCalledWith('testKey', JSON.stringify(15));
  });
});
