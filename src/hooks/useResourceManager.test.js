import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResourceManager } from './useResourceManager';

describe('useResourceManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getByType should return all resources when type is not provided or falsy', () => {
    const { result } = renderHook(() => useResourceManager());

    act(() => {
        result.current.addResource({ type: 'music', name: 'Test 1' });
    });

    act(() => {
        result.current.addResource({ type: 'nature', name: 'Test 2' });
    });

    const allResources = result.current.resources;

    expect(allResources.length).toBe(2);

    expect(result.current.getByType()).toEqual(allResources);
    expect(result.current.getByType('')).toEqual(allResources);
    expect(result.current.getByType(null)).toEqual(allResources);
    expect(result.current.getByType(undefined)).toEqual(allResources);
  });

  it('getByType should filter resources by type when type is provided', () => {
    const { result } = renderHook(() => useResourceManager());

    act(() => {
        result.current.addResource({ type: 'music', name: 'Test 1' });
    });

    act(() => {
        result.current.addResource({ type: 'nature', name: 'Test 2' });
    });

    const musicResources = result.current.getByType('music');
    expect(musicResources.length).toBe(1);
    expect(musicResources[0].type).toBe('music');
    expect(musicResources[0].name).toBe('Test 1');
  });

  it('should add a resource with a unique id', () => {
    const { result } = renderHook(() => useResourceManager());

    act(() => {
        result.current.addResource({ type: 'music', name: 'Test 1' });
    });

    expect(result.current.resources.length).toBe(1);
    expect(result.current.resources[0].id).toBeDefined();
    expect(result.current.resources[0].type).toBe('music');
  });

  it('should delete a resource by id', () => {
    const { result } = renderHook(() => useResourceManager());

    act(() => {
        result.current.addResource({ type: 'music', name: 'Test 1' });
    });

    const resourceId = result.current.resources[0].id;

    act(() => {
        result.current.deleteResource(resourceId);
    });

    expect(result.current.resources.length).toBe(0);
  });
});
