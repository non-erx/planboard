import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { createBoard } from './api/todos';
import { ThemeSwitcher } from './components/ThemeSwitcher';

export function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const board = await createBoard();
      setExiting(true);
      setTimeout(() => navigate(`/board/${board.id}`), 400);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-background flex flex-col items-center justify-center px-4 select-none transition-all duration-400 ${
        exiting ? 'opacity-0 blur-md scale-95' : ''
      }`}
      style={{ transitionDuration: '400ms' }}
    >
      <div className="fixed top-4 left-4">
        <ThemeSwitcher />
      </div>

      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted border border-border mb-8 animate-fade-up">
          <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-3 animate-fade-up-delay-1">PlanBoard</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed animate-fade-up-delay-2">
          A simple, shareable todo board. No account needed &mdash; just create a
          board and share the link with anyone.
        </p>

        <button
          onClick={handleCreate}
          disabled={loading || exiting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 animate-fade-up-delay-3"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
          ) : (
            <>
              Create a board
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground/40 mt-6">
          Each board gets a unique link you can bookmark or share.
        </p>
      </div>
    </div>
  );
}
