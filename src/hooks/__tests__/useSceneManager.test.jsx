import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSceneManager } from '../useSceneManager';

describe('useSceneManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default scenes if local storage is empty', () => {
    const { result } = renderHook(() => useSceneManager());

    // DEFAULT_SCENES is empty [] based on constants/defaults.js
    expect(result.current.scenes).toEqual([]);
    expect(localStorage.getItem('cocoon_scenes_v4')).toEqual(JSON.stringify([]));
  });

  it('should save a new scene and assign an id', () => {
    const { result } = renderHook(() => useSceneManager());

    vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));

    act(() => {
      result.current.saveScene({ name: 'Test Scene', data: 'foo' });
    });

    expect(result.current.scenes.length).toBe(1);
    expect(result.current.scenes[0]).toMatchObject({ name: 'Test Scene', data: 'foo' });
    expect(result.current.scenes[0].id).toBe(new Date('2023-01-01T00:00:00Z').getTime().toString());

    const stored = JSON.parse(localStorage.getItem('cocoon_scenes_v4'));
    expect(stored.length).toBe(1);
    expect(stored[0].name).toBe('Test Scene');
  });

  it('should update an existing scene', () => {
    const { result } = renderHook(() => useSceneManager());

    act(() => {
      result.current.saveScene({ name: 'Scene 1' });
    });

    const savedId = result.current.scenes[0].id;

    act(() => {
      result.current.saveScene({ id: savedId, name: 'Updated Scene 1' });
    });

    expect(result.current.scenes.length).toBe(1);
    expect(result.current.scenes[0].name).toBe('Updated Scene 1');
  });

  it('should delete a scene', () => {
    const { result } = renderHook(() => useSceneManager());

    act(() => {
      result.current.saveScene({ name: 'Scene 1' });
    });
    const id1 = result.current.scenes[0].id;

    // Ensure the next scene gets a different ID by advancing time
    vi.advanceTimersByTime(100);

    act(() => {
      result.current.saveScene({ name: 'Scene 2' });
    });
    const id2 = result.current.scenes[1].id;

    expect(result.current.scenes.length).toBe(2);

    act(() => {
      result.current.deleteScene(id1);
    });

    expect(result.current.scenes.length).toBe(1);
    expect(result.current.scenes[0].id).toBe(id2);
  });

  it('should call onLoad callback when loadScene is called', () => {
    const { result } = renderHook(() => useSceneManager());
    const mockOnLoad = vi.fn();
    const sceneToLoad = { id: '1', name: 'Scene to Load' };

    act(() => {
      result.current.loadScene(sceneToLoad, mockOnLoad);
    });

    expect(mockOnLoad).toHaveBeenCalledTimes(1);
    expect(mockOnLoad).toHaveBeenCalledWith(sceneToLoad);
  });
});
