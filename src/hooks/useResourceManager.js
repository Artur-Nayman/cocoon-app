import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_RESOURCES } from '../constants/defaults';

const RESOURCES_KEY = 'cocoon_resources_v3';

function seedResources() {
  return DEFAULT_RESOURCES.map((r) => ({ ...r, id: Date.now().toString() + Math.random().toString(36).slice(2, 6) }));
}

export function useResourceManager() {
  const [resources, setResources] = useLocalStorage(RESOURCES_KEY, [], seedResources);

  const addResource = (resource) => {
    setResources((prev) => [...prev, { ...resource, id: Date.now().toString() }]);
  };

  const deleteResource = (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const getByType = (type) => {
    if (!type) return resources;
    return resources.filter((r) => r.type === type);
  };

  return { resources, addResource, deleteResource, getByType };
}
