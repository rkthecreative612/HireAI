import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent | { clientX: number; clientY: number }) => void;
  setTheme: (theme: Theme) => void;
  isAnimating: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'hireai_theme';

function applyThemeToDOM(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return 'dark'; // Default to dark mode
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [rippleData, setRippleData] = useState<{
    active: boolean;
    x: number;
    y: number;
    targetTheme: Theme;
  } | null>(null);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = (event?: React.MouseEvent | { clientX: number; clientY: number }) => {
    if (isAnimating) return; // Prevent spamming while transition is playing

    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    // Retrieve origin coordinates from click or default to top-right toggle location
    const x = event && 'clientX' in event && event.clientX > 0 ? event.clientX : window.innerWidth - 64;
    const y = event && 'clientY' in event && event.clientY > 0 ? event.clientY : 32;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Check if the native View Transition API is supported
    // @ts-ignore
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      setIsAnimating(true);
      // @ts-ignore
      const transition = document.startViewTransition(() => {
        setThemeState(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyThemeToDOM(nextTheme);
      });

      transition.ready
        .then(() => {
          const animation = document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxRadius + 50}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 550,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );

          animation.onfinish = () => {
            setIsAnimating(false);
          };
        })
        .catch(() => {
          setIsAnimating(false);
        });
    } else {
      // Fallback: Circular expanding ripple overlay
      setIsAnimating(true);
      setRippleData({
        active: true,
        x,
        y,
        targetTheme: nextTheme,
      });

      setTimeout(() => {
        setThemeState(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyThemeToDOM(nextTheme);
      }, 250);

      setTimeout(() => {
        setRippleData(null);
        setIsAnimating(false);
      }, 650);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isAnimating }}>
      {children}
      {rippleData && rippleData.active && (
        <div
          className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden"
          aria-hidden="true"
        >
          <div
            style={{
              left: `${rippleData.x}px`,
              top: `${rippleData.y}px`,
              backgroundColor: rippleData.targetTheme === 'light' ? '#F8FAFC' : '#0A0A0B',
              animation: 'theme-circular-ripple-overlay 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }}
            className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
