import { useState, useEffect } from 'react';

type Theme = 'orange' | 'green';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('videx-theme');
    return (saved as Theme) || 'orange';
  });

  useEffect(() => {
    localStorage.setItem('videx-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => current === 'orange' ? 'green' : 'orange');
  };

  return { theme, toggleTheme };
}