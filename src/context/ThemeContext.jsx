import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { gsap } from '../animations/gsap'
import { COLORWAYS } from '../data/colorways'

const ThemeContext = createContext(null)
const KEY = 'aura:colorway'

/**
 * Active colorway. Changing it tweens the site-wide CSS variables with GSAP,
 * so every button, glow, gradient and the cursor recolour together.
 */
export function ThemeProvider({ children }) {
  const [colorway, setColorwayState] = useState(() => {
    try {
      const s = localStorage.getItem(KEY)
      return s && COLORWAYS[s] ? s : 'violet'
    } catch {
      return 'violet'
    }
  })

  useEffect(() => {
    const c = COLORWAYS[colorway]
    gsap.to(document.documentElement, {
      '--c-primary': c.primary,
      '--c-secondary': c.secondary,
      '--c-accent': c.accent,
      '--c-glow': c.glow,
      duration: 1,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
    try {
      localStorage.setItem(KEY, colorway)
    } catch {
      /* ignore */
    }
  }, [colorway])

  const setColorway = useCallback((key) => {
    if (COLORWAYS[key]) setColorwayState(key)
  }, [])

  const value = useMemo(() => ({ colorway, color: COLORWAYS[colorway], setColorway }), [colorway, setColorway])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
