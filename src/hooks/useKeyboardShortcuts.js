import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlers.onToggleAll?.();
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        handlers.onToggleChannel?.(idx);
        return;
      }

      if (e.code === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        handlers.onMasterVolumeUp?.();
        return;
      }
      if (e.code === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        handlers.onMasterVolumeDown?.();
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handlers]);
}
