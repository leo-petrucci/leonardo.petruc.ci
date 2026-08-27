import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getCookieTheme(): Theme | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
  const v = m ? decodeURIComponent(m[1]) : null;
  if (v === 'light' || v === 'dark') return v;
  return null;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const body = document.body;
  if (theme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
  }
}

function setCookieTheme(theme: Theme) {
  // 1 year, Lax, explicit path
  document.cookie = `theme=${encodeURIComponent(theme)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getCookieTheme();
    const initial: Theme = saved ?? 'dark';
    setTheme(initial);
    applyTheme(initial);
    if (!saved) setCookieTheme(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    setCookieTheme(next);
  };

  // Use 24x24 pixel icons; dark bg needs white variant, light bg needs dark.
  // Four icons are expected: sun, sun-white, moon, moon-white — all 24x24.
  const iconSrc = theme === 'dark' ? '/pixel-icons/sun-white.png' : '/pixel-icons/moon.png';
  const alt = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  // Avoid hydration mismatch: render a placeholder until mounted, then the real icon.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={alt}
      title={alt}
      className="inline-flex h-6 w-6 items-center justify-center rounded-sm border-0 bg-transparent p-0 leading-none transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {mounted ? (
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
          style={{ imageRendering: 'pixelated' }}
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            t.style.display = 'none';
            const fallback = t.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'block';
          }}
        />
      ) : (
        <span className="h-6 w-6" aria-hidden />
      )}
      <span
        aria-hidden="true"
        className="hidden font-departure text-xs leading-none"
        style={{ display: 'none' }}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </span>
    </button>
  );
}
