import { createContext, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../animations/gsap'
import { prefersReducedMotion } from '../hooks/useMedia'

const LenisContext = createContext(null)

/**
 * Lenis smooth scroll, driven by GSAP's ticker and synced with ScrollTrigger.
 * Starts *stopped*; the Preloader calls lenis.start() when the curtain lifts.
 */
export function LenisProvider({ children }) {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    const instance = new Lenis({
      lerp: prefersReducedMotion() ? 1 : 0.09,
      smoothWheel: !prefersReducedMotion(),
      syncTouch: false,
      autoRaf: false,
    })
    instance.on('scroll', ScrollTrigger.update)
    const raf = (time) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    instance.stop()
    setLenis(instance)
    return () => {
      gsap.ticker.remove(raf)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export const useLenis = () => useContext(LenisContext)
