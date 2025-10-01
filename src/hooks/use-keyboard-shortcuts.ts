import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Hook to show keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Search terms' },
    { keys: ['Ctrl', 'F'], description: 'Add flight' },
    { keys: ['Ctrl', 'T'], description: 'Add transport' },
    { keys: ['Ctrl', 'E'], description: 'Export data' },
    { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ];

  return shortcuts;
}
