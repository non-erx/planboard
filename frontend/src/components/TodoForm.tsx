import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTodoContext } from '../context/TodoContext';

export function TodoForm() {
  const { addTodo, inputDisabled } = useTodoContext();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputDisabled) inputRef.current?.focus();
  }, [inputDisabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    await addTodo(trimmed);
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-4">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={inputDisabled}
        placeholder="What needs to be done?"
        className="w-full bg-muted border border-border rounded-lg px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-ring/20 transition-all disabled:opacity-50"
        autoFocus
      />
      <button
        type="submit"
        disabled={inputDisabled || !query.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
      >
        <Plus className="w-4 h-4" />
      </button>
    </form>
  );
}
