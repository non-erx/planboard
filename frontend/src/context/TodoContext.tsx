import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { Todo, Board, FilterType, Tag } from '../types/Todo';
import * as api from '../api/todos';

interface TodoContextType {
  board: Board | null;
  todos: Todo[];
  tags: Tag[];
  filter: FilterType;
  filteredTodos: Todo[];
  errorMessage: string;
  isLoading: boolean;
  loadingTodoIds: Set<number>;
  inputDisabled: boolean;

  setFilter: (f: FilterType) => void;
  addTodo: (title: string) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
  toggleTodo: (todo: Todo) => Promise<void>;
  editTodo: (id: number, title: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  clearError: () => void;
  updateBoardName: (name: string) => Promise<void>;
  createTag: (name: string, color: string) => Promise<void>;
  updateTag: (tagId: number, data: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<void>;
  deleteTag: (tagId: number) => Promise<void>;
  addTagToTodo: (todoId: number, tagId: number) => Promise<void>;
  removeTagFromTodo: (todoId: number, tagId: number) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | null>(null);

export function useTodoContext() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodoContext must be used within TodoProvider');
  return ctx;
}

interface Props {
  boardId: string;
  children: ReactNode;
}

export function TodoProvider({ boardId, children }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTodoIds, setLoadingTodoIds] = useState<Set<number>>(new Set());
  const [inputDisabled, setInputDisabled] = useState(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showError = useCallback((msg: string) => {
    setErrorMessage(msg);
    clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setErrorMessage(''), 3000);
  }, []);

  const clearError = useCallback(() => {
    clearTimeout(errorTimer.current);
    setErrorMessage('');
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const [b, t, tg] = await Promise.all([
          api.getBoard(boardId),
          api.getTodos(boardId),
          api.getTags(boardId),
        ]);
        if (!cancelled) {
          setBoard(b);
          setTodos(t);
          setTags(tg);
        }
      } catch {
        if (!cancelled) showError('Unable to load board');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [boardId, showError]);

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const addTodo = useCallback(async (title: string) => {
    setInputDisabled(true);
    try {
      const newTodo = await api.addTodo(boardId, title);
      setTodos((prev) => [...prev, newTodo]);
    } catch {
      showError('Unable to add a todo');
    } finally {
      setInputDisabled(false);
    }
  }, [boardId, showError]);

  const removeTodo = useCallback(async (id: number) => {
    setLoadingTodoIds((prev) => new Set(prev).add(id));
    const backup = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.deleteTodo(boardId, id);
    } catch {
      setTodos(backup);
      showError('Unable to delete a todo');
    } finally {
      setLoadingTodoIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [boardId, todos, showError]);

  const toggleTodo = useCallback(async (todo: Todo) => {
    setLoadingTodoIds((prev) => new Set(prev).add(todo.id));
    setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, completed: !t.completed } : t));
    try {
      await api.updateTodo(boardId, todo.id, { completed: !todo.completed });
    } catch {
      setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, completed: todo.completed } : t));
      showError('Unable to update a todo');
    } finally {
      setLoadingTodoIds((prev) => { const s = new Set(prev); s.delete(todo.id); return s; });
    }
  }, [boardId, showError]);

  const editTodo = useCallback(async (id: number, title: string) => {
    setLoadingTodoIds((prev) => new Set(prev).add(id));
    try {
      const updated = await api.updateTodo(boardId, id, { title });
      setTodos((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch {
      showError('Unable to update a todo');
    } finally {
      setLoadingTodoIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [boardId, showError]);

  const clearCompleted = useCallback(async () => {
    const backup = todos;
    setTodos((prev) => prev.filter((t) => !t.completed));
    try {
      const remaining = await api.clearCompleted(boardId);
      setTodos(remaining);
    } catch {
      setTodos(backup);
      showError('Unable to clear completed todos');
    }
  }, [boardId, todos, showError]);

  const updateBoardName = useCallback(async (name: string) => {
    try {
      const updated = await api.updateBoard(boardId, name);
      setBoard(updated);
    } catch {
      showError('Unable to update board name');
    }
  }, [boardId, showError]);

  const createTagAction = useCallback(async (name: string, color: string) => {
    try {
      const tag = await api.createTag(boardId, name, color);
      setTags((prev) => [...prev, tag]);
    } catch {
      showError('Unable to create tag');
    }
  }, [boardId, showError]);

  const updateTagAction = useCallback(async (tagId: number, data: Partial<Pick<Tag, 'name' | 'color'>>) => {
    try {
      const updated = await api.updateTag(boardId, tagId, data);
      setTags((prev) => prev.map((t) => t.id === tagId ? updated : t));
    } catch {
      showError('Unable to update tag');
    }
  }, [boardId, showError]);

  const deleteTagAction = useCallback(async (tagId: number) => {
    const backup = tags;
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    setTodos((prev) => prev.map((t) => ({ ...t, tags: t.tags.filter((tg) => tg.id !== tagId) })));
    try {
      await api.deleteTag(boardId, tagId);
    } catch {
      setTags(backup);
      showError('Unable to delete tag');
    }
  }, [boardId, tags, showError]);

  const addTagToTodoAction = useCallback(async (todoId: number, tagId: number) => {
    try {
      const updated = await api.addTagToTodo(boardId, todoId, tagId);
      setTodos((prev) => prev.map((t) => t.id === todoId ? updated : t));
    } catch {
      showError('Unable to add tag');
    }
  }, [boardId, showError]);

  const removeTagFromTodoAction = useCallback(async (todoId: number, tagId: number) => {
    try {
      const updated = await api.removeTagFromTodo(boardId, todoId, tagId);
      setTodos((prev) => prev.map((t) => t.id === todoId ? updated : t));
    } catch {
      showError('Unable to remove tag');
    }
  }, [boardId, showError]);

  return (
    <TodoContext.Provider
      value={{
        board,
        todos,
        tags,
        filter,
        filteredTodos,
        errorMessage,
        isLoading,
        loadingTodoIds,
        inputDisabled,
        setFilter,
        addTodo,
        removeTodo,
        toggleTodo,
        editTodo,
        clearCompleted,
        clearError,
        updateBoardName,
        createTag: createTagAction,
        updateTag: updateTagAction,
        deleteTag: deleteTagAction,
        addTagToTodo: addTagToTodoAction,
        removeTagFromTodo: removeTagFromTodoAction,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}
