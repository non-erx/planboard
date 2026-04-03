import { useTodoContext } from '../context/TodoContext';
import { cn } from '../lib/utils';
import type { FilterType } from '../types/Todo';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export function TodoFooter() {
  const { todos, filter, setFilter, clearCompleted } = useTodoContext();

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  if (todos.length === 0) return null;

  return (
    <footer className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
      <span className="tabular-nums">
        {activeCount} item{activeCount !== 1 ? 's' : ''} left
      </span>

      <div className="flex gap-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'px-2.5 py-1 rounded-md transition-colors',
              filter === key
                ? 'bg-secondary text-foreground'
                : 'hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={clearCompleted}
        disabled={completedCount === 0}
        className="hover:text-foreground transition-colors disabled:invisible"
      >
        Clear completed
      </button>
    </footer>
  );
}
