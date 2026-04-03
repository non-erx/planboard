import { useTodoContext } from '../context/TodoContext';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { filteredTodos, isLoading } = useTodoContext();

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

  return (
    <div className="divide-y divide-border border border-border rounded-lg">
      {filteredTodos.map((todo, i) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isFirst={i === 0}
          isLast={i === filteredTodos.length - 1}
        />
      ))}
    </div>
  );
}
