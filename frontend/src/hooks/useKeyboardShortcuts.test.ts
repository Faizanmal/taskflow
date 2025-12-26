import { renderHook, act } from '@testing-library/react';
import useKeyboardShortcuts from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers and calls shortcut handlers', () => {
    const handler = jest.fn();
    const shortcuts = {
      'ctrl+k': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Simulate Ctrl+K
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls handler with the keyboard event', () => {
    const handler = jest.fn();
    const shortcuts = {
      'ctrl+k': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledWith(expect.any(KeyboardEvent));
  });

  it('supports cmd/meta key on Mac', () => {
    const handler = jest.fn();
    const shortcuts = {
      'cmd+k': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('supports shift modifier', () => {
    const handler = jest.fn();
    const shortcuts = {
      'shift+/': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: '/',
        shiftKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('supports alt modifier', () => {
    const handler = jest.fn();
    const shortcuts = {
      'alt+n': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        altKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('supports multiple modifiers', () => {
    const handler = jest.fn();
    const shortcuts = {
      'ctrl+shift+p': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'p',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler when key does not match', () => {
    const handler = jest.fn();
    const shortcuts = {
      'ctrl+k': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'l',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call handler when modifier does not match', () => {
    const handler = jest.fn();
    const shortcuts = {
      'ctrl+k': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        altKey: true, // Wrong modifier
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not trigger when disabled', () => {
    const handler = jest.fn();
    const shortcuts = {
      'ctrl+k': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple shortcuts', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const shortcuts = {
      'ctrl+k': handler1,
      'ctrl+n': handler2,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      }));
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      }));
    });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listeners on unmount', () => {
    const handler = jest.fn();
    const shortcuts = {
      'ctrl+k': handler,
    };

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    unmount();

    // Trigger the shortcut after unmount
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    // Handler should not be called after unmount
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports special keys like Escape', () => {
    const handler = jest.fn();
    const shortcuts = {
      'escape': handler,
    };

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
