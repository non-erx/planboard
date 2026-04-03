import { useState } from 'react';
import { Link2, Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  boardId: string;
}

export function ShareLink({ boardId }: Props) {
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/board/${boardId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-muted-foreground max-w-[280px]">
        <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate font-mono">{url}</span>
      </div>
      <button
        onClick={copy}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
          copied
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-secondary text-foreground border border-border hover:bg-accent'
        )}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
