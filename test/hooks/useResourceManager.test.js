import { renderHook, act } from '@testing-library/react';
import { useResourceManager } from '../../src/hooks/useResourceManager';
import { describe, it, expect, beforeEach } from 'vitest';

describe('useResourceManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty resources or seeded defaults', () => {
    const { result } = renderHook(() => useResourceManager());
    expect(Array.isArray(result.current.resources)).toBe(true);
  });

  it('should add a resource with a generated id', () => {
    const { result } = renderHook(() => useResourceManager());
    act(() => {
      result.current.addResource({ name: 'Test Resource', type: 'nature' });
    });

    const resources = result.current.resources;
    expect(resources.length).toBe(1);
    expect(resources[0].name).toBe('Test Resource');
    expect(resources[0].type).toBe('nature');
    expect(resources[0]).toHaveProperty('id');
  });

  it('should delete a resource by id', () => {
    const { result } = renderHook(() => useResourceManager());
    act(() => {
      result.current.addResource({ name: 'Test Resource', type: 'nature' });
    });

    const resourceId = result.current.resources[0].id;

    act(() => {
      result.current.deleteResource(resourceId);
    });

    expect(result.current.resources.length).toBe(0);
  });

  it('should get resources by type', () => {
    const { result } = renderHook(() => useResourceManager());
    act(() => {
      result.current.addResource({ name: 'Nature 1', type: 'nature' });
    });
    act(() => {
      result.current.addResource({ name: 'Nature 2', type: 'nature' });
    });
    act(() => {
      result.current.addResource({ name: 'City 1', type: 'city' });
    });

    const natureResources = result.current.getByType('nature');
    expect(natureResources.length).toBe(2);
    expect(natureResources[0].name).toBe('Nature 1');
    expect(natureResources[1].name).toBe('Nature 2');

    const cityResources = result.current.getByType('city');
    expect(cityResources.length).toBe(1);
    expect(cityResources[0].name).toBe('City 1');
  });

  it('should return all resources if type is falsy', () => {
    const { result } = renderHook(() => useResourceManager());
    act(() => {
      result.current.addResource({ name: 'Nature 1', type: 'nature' });
    });
    act(() => {
      result.current.addResource({ name: 'City 1', type: 'city' });
    });

    const allResources = result.current.getByType();
    expect(allResources.length).toBe(2);
  });
});
