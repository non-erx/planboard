import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useTodoContext } from '../context/TodoContext';

export function Header() {
  const { board, updateBoardName } = useTodoContext();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEditing = () => {
    setName(board?.name || '');
    setEditing(true);
  };

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== board?.name) {
      updateBoardName(trimmed);
    }
    setEditing(false);
  };

  return (
    <header className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveName();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="text-2xl font-semibold tracking-tight bg-transparent border-b border-muted-foreground/30 outline-none text-foreground w-full"
            maxLength={120}
          />
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight truncate">
              {board?.name || 'PlanBoard'}
            </h1>
            <button
              onClick={startEditing}
              className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Rename board"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
