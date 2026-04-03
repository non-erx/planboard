import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Tag } from 'lucide-react';
import { useTodoContext } from '../context/TodoContext';
import { cn } from '../lib/utils';
import type { Todo } from '../types/Todo';

interface Props {
  todo: Todo;
  isFirst?: boolean;
  isLast?: boolean;
}

export function TodoItem({ todo, isFirst, isLast }: Props) {
  const { toggleTodo, removeTodo, editTodo, loadingTodoIds, tags, addTagToTodo, removeTagFromTodo } = useTodoContext();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [exiting, setExiting] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [exitingTagIds, setExitingTagIds] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const tagPickerRef = useRef<HTMLDivElement>(null);
  const isLoading = loadingTodoIds.has(todo.id);

  const todoTagIds = new Set(todo.tags.map((t) => t.id));
  const unassignedTags = tags.filter((t) => !todoTagIds.has(t.id));

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!showTagPicker) return;
    const handler = (e: MouseEvent) => {
      if (tagPickerRef.current && !tagPickerRef.current.contains(e.target as Node)) {
        setShowTagPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTagPicker]);

  const startEditing = () => {
    setEditValue(todo.title);
    setEditing(true);
  };

  const saveEdit = async () => {
    const trimmed = editValue.trim();
    setEditing(false);
    if (!trimmed) {
      handleRemove();
      return;
    }
    if (trimmed !== todo.title) {
      await editTodo(todo.id, trimmed);
    }
  };

  const handleRemove = () => {
    setExiting(true);
    setTimeout(() => removeTodo(todo.id), 280);
  };

  const handleRemoveTag = (tagId: number) => {
    setExitingTagIds((prev) => new Set(prev).add(tagId));
    setTimeout(() => {
      removeTagFromTodo(todo.id, tagId);
      setExitingTagIds((prev) => { const s = new Set(prev); s.delete(tagId); return s; });
    }, 280);
  };

  if (editing) {
    return (
      <div className="bg-muted px-4 py-3">
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="w-full bg-transparent text-sm text-foreground outline-none border-b border-muted-foreground/30 pb-1"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3 bg-card hover:bg-muted/50',
        isLoading && 'opacity-50 pointer-events-none',
        exiting ? 'todo-item-exit' : 'todo-item-enter',
        isFirst && 'rounded-t-lg',
        isLast && 'rounded-b-lg'
      )}
    >
      <button
        onClick={() => toggleTodo(todo)}
        className={cn(
          'flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 transition-all flex items-center justify-center',
          todo.completed
            ? 'border-emerald-500/70 bg-emerald-500/20'
            : 'border-border hover:border-muted-foreground'
        )}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-emerald-400 checkbox-done" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          onDoubleClick={startEditing}
          className={cn(
            'text-sm cursor-default select-none transition-all block',
            todo.completed ? 'line-through text-muted-foreground/50' : 'text-foreground'
          )}
        >
          {todo.title}
        </span>

        {(todo.tags.length > 0 || tags.length > 0) && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap relative">
            {todo.tags.map((tag) => (
              <span
                key={tag.id}
                className={cn(
                  'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-white leading-tight cursor-default',
                  exitingTagIds.has(tag.id) ? 'tag-pill-exit' : 'tag-pill'
                )}
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-0.5 hover:opacity-70 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {unassignedTags.length > 0 && (
              <div className="relative" ref={tagPickerRef}>
                <button
                  onClick={() => setShowTagPicker(!showTagPicker)}
                  className="tag-add-btn inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <Tag className="w-2.5 h-2.5 plus-icon" />
                </button>

                {showTagPicker && (
                  <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg p-1.5 min-w-[120px] tag-picker-enter">
                    {unassignedTags.map((tag, i) => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          addTagToTodo(todo.id, tag.id);
                          setShowTagPicker(false);
                        }}
                        className="tag-picker-row flex items-center gap-2 w-full px-2 py-1 rounded text-xs text-foreground hover:bg-muted/80 transition-colors"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0 mt-0.5" />
      ) : (
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded text-transparent group-hover:text-muted-foreground hover:!text-destructive-foreground transition-colors mt-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
