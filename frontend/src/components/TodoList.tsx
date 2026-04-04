import { useState, useRef, useCallback } from 'react';
import { useTodoContext } from '../context/TodoContext';
import { TodoItem } from './TodoItem';
import { cn } from '../lib/utils';

export function TodoList() {
  const { filteredTodos, isLoading, reorderTodos, filter } = useTodoContext();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchCurrentIndex = useRef<number | null>(null);
  const draggingId = useRef<number | null>(null);

  const canDrag = filter === 'all';

  const getItems = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) return filteredTodos;
    const items = [...filteredTodos];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(overIndex, 0, moved);
    return items;
  };

  const commitReorder = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const items = [...filteredTodos];
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    reorderTodos(items.map((t) => t.id));
  }, [filteredTodos, reorderTodos]);

  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    if (!canDrag) return;
    e.dataTransfer.effectAllowed = 'move';
    setDragIndex(idx);
    draggingId.current = filteredTodos[idx].id;
  };

  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(idx);
  };

  const handleDragEnd = () => {
    if (dragIndex !== null && overIndex !== null) {
      commitReorder(dragIndex, overIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
    draggingId.current = null;
  };

  const getIndexFromY = (y: number): number => {
    if (!containerRef.current) return 0;
    const children = Array.from(containerRef.current.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (y < rect.top + rect.height / 2) return i;
    }
    return children.length - 1;
  };

  const handleTouchStart = (idx: number) => (e: React.TouchEvent) => {
    if (!canDrag) return;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentIndex.current = idx;
    draggingId.current = filteredTodos[idx].id;

    const timeout = setTimeout(() => {
      setDragIndex(idx);
      setOverIndex(idx);
      document.body.classList.add('dragging-active');
    }, 200);

    const el = e.currentTarget as HTMLElement;
    const cancel = () => {
      clearTimeout(timeout);
      el.removeEventListener('touchmove', cancel);
      el.removeEventListener('touchend', cancel);
    };
    el.addEventListener('touchend', cancel, { once: true });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragIndex === null) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    const idx = getIndexFromY(y);
    setOverIndex(idx);
    touchCurrentIndex.current = idx;
  };

  const handleTouchEnd = () => {
    if (dragIndex !== null && touchCurrentIndex.current !== null) {
      commitReorder(dragIndex, touchCurrentIndex.current);
    }
    setDragIndex(null);
    setOverIndex(null);
    touchCurrentIndex.current = null;
    draggingId.current = null;
    document.body.classList.remove('dragging-active');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (filteredTodos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground/60 text-sm">
        No todos yet. Add one above.
      </div>
    );
  }

  const displayItems = getItems();

  return (
    <div
      ref={containerRef}
      className="divide-y divide-border border border-border rounded-lg"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {displayItems.map((todo, i) => (
        <div
          key={todo.id}
          draggable={canDrag}
          onDragStart={handleDragStart(i)}
          onDragOver={handleDragOver(i)}
          onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart(i)}
          className={cn(
            'touch-manipulation',
            dragIndex !== null && overIndex === i && dragIndex !== i && 'border-t-2 border-t-ring',
            dragIndex !== null && draggingId.current === todo.id && 'opacity-40',
          )}
        >
          <TodoItem
            todo={todo}
            isFirst={i === 0}
            isLast={i === displayItems.length - 1}
          />
        </div>
      ))}
    </div>
  );
}
