import { useCallback, useEffect, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description?: string;
}

/**
 * Hook for handling global keyboard shortcuts
 * Supports Ctrl/Cmd key combinations
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] | Record<string, () => void>, options?: { enabled?: boolean }) {
  const normalizedShortcuts = useMemo(() => {
    if (Array.isArray(shortcuts)) {
      return shortcuts;
    }
    return Object.entries(shortcuts).map(([keyCombo, handler]) => {
      const parts = keyCombo.split('+');
      const key = parts.pop()!;
      const modifiers = {
        ctrlKey: parts.includes('ctrl'),
        metaKey: parts.includes('cmd') || parts.includes('meta'),
        shiftKey: parts.includes('shift'),
        altKey: parts.includes('alt'),
      };
      return { key, handler, ...modifiers };
    });
  }, [shortcuts]);

  const shortcutsRef = useRef(normalizedShortcuts);
  shortcutsRef.current = normalizedShortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isEditable = target.isContentEditable;
    
    if (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      isEditable
    ) {
      // Allow Escape key in inputs
      if (event.key !== 'Escape') {
        return;
      }
    }

    for (const shortcut of shortcutsRef.current) {
      const ctrlOrMeta = shortcut.ctrlKey || shortcut.metaKey;
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = ctrlOrMeta ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Default keyboard shortcuts for the app
 */
export const DEFAULT_SHORTCUTS = {
  COMMAND_PALETTE: { key: 'k', ctrlKey: true, description: 'Open command palette' },
  NEW_TASK: { key: 'n', ctrlKey: true, description: 'Create new task' },
  SEARCH: { key: '/', description: 'Focus search' },
  ESCAPE: { key: 'Escape', description: 'Close modal/panel' },
};

export default useKeyboardShortcuts;
