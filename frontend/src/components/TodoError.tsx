import { X } from 'lucide-react';
import { useTodoContext } from '../context/TodoContext';
import { cn } from '../lib/utils';

export function TodoError() {
  const { errorMessage, clearError } = useTodoContext();

  if (!errorMessage) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        'bg-destructive/90 text-destructive-foreground text-sm',
        'shadow-lg border border-red-900/50 backdrop-blur-sm',
        'toast-enter'
      )}
    >
      <span>{errorMessage}</span>
      <button
        onClick={clearError}
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
