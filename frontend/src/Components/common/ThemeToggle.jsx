import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

function getInitialTheme() {
  const savedTheme = localStorage.getItem('draftly-theme')
  const theme = savedTheme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  return theme
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)
  const isDark = theme === 'dark'

  function toggleTheme() {
    const nextTheme = isDark ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    localStorage.setItem('draftly-theme', nextTheme)
    setTheme(nextTheme)
  }

  return (
    <button
      className={`theme-toggle ${isDark ? 'is-dark' : ''}`}
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <Sun className="theme-sun" size={14} />
        <Moon className="theme-moon" size={14} />
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-label">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}
