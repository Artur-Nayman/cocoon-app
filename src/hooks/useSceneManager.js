import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_SCENES } from '../constants/defaults';

const DEFAULT_SCENES_KEY = 'cocoon_scenes_v3';

function seedScenes() {
  return DEFAULT_SCENES.map((s) => ({ ...s, id: Date.now().toString() + Math.random().toString(36).slice(2, 6) }));
}

export function useSceneManager() {
  const [scenes, setScenes] = useLocalStorage(DEFAULT_SCENES_KEY, [], seedScenes);

  const saveScene = (scene) => {
    setScenes((prev) => {
      const idx = prev.findIndex((s) => s.id === scene.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = scene;
        return updated;
      }
      return [...prev, { ...scene, id: Date.now().toString() }];
    });
  };

  const deleteScene = (id) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
  };

  const loadScene = (scene, onLoad) => {
    if (onLoad) onLoad(scene);
  };

  return {
    scenes,
    saveScene,
    deleteScene,
    loadScene,
  };
}
