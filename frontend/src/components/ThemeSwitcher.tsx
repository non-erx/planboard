import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeSwitcher() {
  const { mode, toggle } = useTheme();
  const [animKey, setAnimKey] = useState(0);

  const handleClick = () => {
    setAnimKey((k) => k + 1);
    toggle();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={mode === 'light' ? 'Switch to dark' : 'Switch to light'}
    >
      {mode === 'light' ? (
        <Moon key={`moon-${animKey}`} className="w-4 h-4 theme-icon-enter" />
      ) : (
        <Sun key={`sun-${animKey}`} className="w-4 h-4 theme-icon-enter" />
      )}
    </button>
  );
}
