import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Search terms' },
    { keys: ['Ctrl', 'F'], description: 'Show flights to book' },
    { keys: ['Ctrl', 'T'], description: 'Toggle theme' },
    { keys: ['Ctrl', 'E'], description: 'Export data' },
    { keys: ['Ctrl', '/'], description: 'Expand/collapse all' },
    { keys: ['?'], description: 'Show this help' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">?</kbd> anytime to see these shortcuts</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
