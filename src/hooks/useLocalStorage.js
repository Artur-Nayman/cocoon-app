import { useState, useCallback } from 'react';

function hasKey(key) {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function useLocalStorage(key, initialValue, seedValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (!hasKey(key) && seedValue !== undefined) {
        const seeded = seedValue instanceof Function ? seedValue() : seedValue;
        localStorage.setItem(key, JSON.stringify(seeded));
        return seeded;
      }
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    const next = value instanceof Function ? value(storedValue) : value;
    setStoredValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [key, storedValue]);

  return [storedValue, setValue];
}
