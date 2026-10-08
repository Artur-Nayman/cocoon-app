import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSceneManager } from '../useSceneManager';

vi.mock('../../constants/defaults', () => ({
  DEFAULT_SCENES: [
    { name: 'Default Scene 1', data: 'data1' },
    { name: 'Default Scene 2', data: 'data2' },
  ],
}));

describe('useSceneManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with seeded default scenes if localStorage is empty', () => {
    const { result } = renderHook(() => useSceneManager());

    expect(result.current.scenes).toHaveLength(2);
    expect(result.current.scenes[0].name).toBe('Default Scene 1');
    expect(result.current.scenes[1].name).toBe('Default Scene 2');

    // Check if id is generated
    expect(result.current.scenes[0].id).toBeDefined();
    expect(result.current.scenes[1].id).toBeDefined();

    // Check if it's saved in localStorage
    const saved = JSON.parse(localStorage.getItem('cocoon_scenes_v4'));
    expect(saved).toHaveLength(2);
  });

  it('should save a new scene when id is not in the list', () => {
    const { result } = renderHook(() => useSceneManager());

    act(() => {
      result.current.saveScene({ name: 'New Scene', data: 'newData' });
    });

    expect(result.current.scenes).toHaveLength(3);
    expect(result.current.scenes[2].name).toBe('New Scene');
    expect(result.current.scenes[2].id).toBeDefined();
  });

  it('should update an existing scene when id matches', () => {
    const { result } = renderHook(() => useSceneManager());

    const existingScene = result.current.scenes[0];
    const updatedScene = { ...existingScene, name: 'Updated Scene 1' };

    act(() => {
      result.current.saveScene(updatedScene);
    });

    expect(result.current.scenes).toHaveLength(2);
    expect(result.current.scenes[0].name).toBe('Updated Scene 1');
    expect(result.current.scenes[0].id).toBe(existingScene.id);
  });

  it('should delete a scene by id', () => {
    const { result } = renderHook(() => useSceneManager());

    const sceneToDeleteId = result.current.scenes[0].id;

    act(() => {
      result.current.deleteScene(sceneToDeleteId);
    });

    expect(result.current.scenes).toHaveLength(1);
    expect(result.current.scenes[0].name).toBe('Default Scene 2');
  });

  it('should trigger callback on loadScene', () => {
    const { result } = renderHook(() => useSceneManager());
    const mockCallback = vi.fn();
    const sceneToLoad = result.current.scenes[0];

    act(() => {
      result.current.loadScene(sceneToLoad, mockCallback);
    });

    expect(mockCallback).toHaveBeenCalledWith(sceneToLoad);
  });

  it('should load scenes from localStorage if they exist', () => {
    const existingScenes = [
      { id: '123', name: 'Saved Scene', data: 'savedData' }
    ];
    localStorage.setItem('cocoon_scenes_v4', JSON.stringify(existingScenes));

    const { result } = renderHook(() => useSceneManager());

    expect(result.current.scenes).toHaveLength(1);
    expect(result.current.scenes[0].name).toBe('Saved Scene');
    expect(result.current.scenes[0].id).toBe('123');
  });
});
