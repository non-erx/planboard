import { useState, useRef, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { useTodoContext } from '../context/TodoContext';
import { cn } from '../lib/utils';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#64748b',
];

export function TagManager() {
  const { tags, createTag, deleteTag } = useTodoContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[6]);
  const [exitingIds, setExitingIds] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createTag(trimmed, color);
    setName('');
    setColor(PRESET_COLORS[6]);
  };

  const handleDelete = useCallback((tagId: number) => {
    setExitingIds((prev) => new Set(prev).add(tagId));
    setTimeout(() => {
      deleteTag(tagId);
      setExitingIds((prev) => { const s = new Set(prev); s.delete(tagId); return s; });
    }, 280);
  }, [deleteTag]);

  const handleToggle = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white',
              exitingIds.has(tag.id) ? 'tag-pill-exit' : 'tag-pill'
            )}
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => handleDelete(tag.id)}
              className="ml-0.5 hover:opacity-70 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <button
          onClick={handleToggle}
          className={cn(
            'tag-add-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
            'border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors'
          )}
        >
          <Plus className="w-3 h-3 plus-icon" />
          Tag
        </button>
      </div>

      {isOpen && (
        <div className={cn('mt-3 p-3 rounded-lg border border-border bg-card', isClosing ? 'tag-panel-exit' : 'tag-panel-enter')}>
          <div className="flex items-center gap-2 mb-2">
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="Tag name - press Enter to add"
              maxLength={50}
              className="w-full bg-transparent text-sm text-foreground outline-none border-b border-muted-foreground/30 pb-1 placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_COLORS.map((c, i) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  'w-5 h-5 rounded-full transition-all color-swatch',
                  color === c ? 'ring-2 ring-offset-2 ring-offset-card scale-110' : 'hover:scale-110'
                )}
                style={{
                  backgroundColor: c,
                  animationDelay: `${i * 30}ms`,
                  ...(color === c ? { ringColor: c } : {}),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
