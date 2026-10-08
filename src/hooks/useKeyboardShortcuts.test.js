import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useKeyboardShortcuts', () => {
  let handlers;

  beforeEach(() => {
    handlers = {
      onToggleAll: vi.fn(),
      onToggleChannel: vi.fn(),
      onMasterVolumeUp: vi.fn(),
      onMasterVolumeDown: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls onToggleAll when Space is pressed and prevents default', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const event = new KeyboardEvent('keydown', { code: 'Space', cancelable: true });

    // Check preventDefault by seeing if the event gets cancelled
    // (dispatchEvent returns false if preventDefault was called)
    const result = document.dispatchEvent(event);

    expect(result).toBe(false);
    expect(handlers.onToggleAll).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleChannel with correct index when number keys 1-9 are pressed', () => {
    renderHook(() => useKeyboardShortcuts(handlers));

    const event1 = new KeyboardEvent('keydown', { key: '1' });
    document.dispatchEvent(event1);
    expect(handlers.onToggleChannel).toHaveBeenCalledWith(0);

    const event9 = new KeyboardEvent('keydown', { key: '9' });
    document.dispatchEvent(event9);
    expect(handlers.onToggleChannel).toHaveBeenCalledWith(8);

    expect(handlers.onToggleChannel).toHaveBeenCalledTimes(2);
  });

  it('calls onMasterVolumeUp when Ctrl + ArrowUp is pressed and prevents default', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const event = new KeyboardEvent('keydown', { code: 'ArrowUp', ctrlKey: true, cancelable: true });

    const result = document.dispatchEvent(event);

    expect(result).toBe(false);
    expect(handlers.onMasterVolumeUp).toHaveBeenCalledTimes(1);
  });

  it('calls onMasterVolumeDown when Ctrl + ArrowDown is pressed and prevents default', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const event = new KeyboardEvent('keydown', { code: 'ArrowDown', ctrlKey: true, cancelable: true });

    const result = document.dispatchEvent(event);

    expect(result).toBe(false);
    expect(handlers.onMasterVolumeDown).toHaveBeenCalledTimes(1);
  });

  it('ignores key presses if target is an INPUT element', () => {
    renderHook(() => useKeyboardShortcuts(handlers));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true });
    input.dispatchEvent(event);

    expect(handlers.onToggleAll).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('ignores key presses if target is a TEXTAREA element', () => {
    renderHook(() => useKeyboardShortcuts(handlers));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true });
    textarea.dispatchEvent(event);

    expect(handlers.onToggleAll).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it('ignores key presses if target is content editable', () => {
    renderHook(() => useKeyboardShortcuts(handlers));

    const div = document.createElement('div');
    div.contentEditable = 'true';
    // jsdom doesn't fully implement isContentEditable for div elements where contentEditable="true"
    // We can mock it directly on the instance to simulate a real browser behavior.
    Object.defineProperty(div, 'isContentEditable', { value: true, configurable: true });

    document.body.appendChild(div);
    div.focus();

    const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true });
    div.dispatchEvent(event);

    expect(handlers.onToggleAll).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts(handlers));

    unmount();

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    document.dispatchEvent(event);

    expect(handlers.onToggleAll).not.toHaveBeenCalled();
  });
});
