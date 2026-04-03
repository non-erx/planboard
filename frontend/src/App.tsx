import { TodoProvider, useTodoContext } from './context/TodoContext';
import { Header } from './components/Header';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import { TodoError } from './components/TodoError';
import { ShareLink } from './components/ShareLink';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { TagManager } from './components/TagManager';

interface Props {
  boardId: string;
}

function BoardInner({ boardId }: Props) {
  const { isLoading } = useTodoContext();

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-200">
      <nav className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          <ThemeSwitcher />
          {!isLoading && <ShareLink boardId={boardId} />}
        </div>
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div className="animate-fade-up">
          <Header />
        </div>
        <div className="animate-fade-up-delay-1">
          <TagManager />
          <TodoForm />
        </div>
        <div className="animate-fade-up-delay-2">
          <TodoList />
          <TodoFooter />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground/40">
          Double-click a todo to edit &middot; Share the link for collaboration
        </div>
      </footer>

      <TodoError />
    </div>
  );
}

export function BoardPage({ boardId }: Props) {
  return (
    <TodoProvider boardId={boardId}>
      <BoardInner boardId={boardId} />
    </TodoProvider>
  );
}
