import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../animations/gsap'
import { useLenis } from './LenisContext'
import TransitionLayer from '../components/TransitionLayer'
import { prefersReducedMotion } from '../hooks/useMedia'

const TransitionContext = createContext(null)
const ReadyContext = createContext(false)

/**
 * Page transition system.
 *  navigateTo(path) → coloured panels sweep up & cover the page, logo flashes,
 *  the route changes underneath, the new <Page> calls reveal() on mount and the
 *  panels sweep away. `ready` is false while covered (and during the preloader)
 *  so hero animations wait for the reveal.
 */
export function TransitionProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const lenis = useLenis()
  const layerRef = useRef(null)
  const pending = useRef(false)
  const busy = useRef(false)
  const [ready, setReady] = useState(false)

  const navigateTo = useCallback(
    (to) => {
      if (busy.current) return
      if (to === location.pathname + location.search) return
      const layer = layerRef.current
      if (!layer) return navigate(to)

      busy.current = true
      pending.current = true
      setReady(false)
      const panels = layer.querySelectorAll('[data-panel]')
      const logo = layer.querySelector('[data-logo]')
      const reduced = prefersReducedMotion()

      gsap.set(layer, { pointerEvents: 'auto' })
      const tl = gsap.timeline({
        defaults: { ease: 'auraInOut' },
        onComplete: () => {
          navigate(to)
          // hard-reset scroll under the cover
          lenis?.scrollTo(0, { immediate: true, force: true })
          window.scrollTo(0, 0)
        },
      })
      if (reduced) {
        tl.to(panels[panels.length - 1], { yPercent: 0, duration: 0.3, ease: 'none' })
      } else {
        tl.to(panels, { yPercent: 0, duration: 0.75, stagger: 0.09 })
          .fromTo(logo, { scale: 0.7, opacity: 0, rotate: -6 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: 'auraBack' }, '-=0.45')
          .to(logo, { opacity: 1, duration: 0.15 })
      }
    },
    [navigate, location.pathname, location.search, lenis],
  )

  const reveal = useCallback(() => {
    const layer = layerRef.current
    if (!layer || !pending.current) return
    pending.current = false
    lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    const panels = gsap.utils.toArray(layer.querySelectorAll('[data-panel]')).reverse()
    const logo = layer.querySelector('[data-logo]')
    const reduced = prefersReducedMotion()
    ScrollTrigger.refresh()

    const tl = gsap.timeline({
      defaults: { ease: 'auraInOut' },
      onComplete: () => {
        gsap.set(panels, { yPercent: 100 })
        gsap.set(layer, { pointerEvents: 'none' })
        busy.current = false
        ScrollTrigger.refresh()
      },
    })
    if (reduced) {
      tl.to(panels, { yPercent: -100, duration: 0.3, ease: 'none' })
      setReady(true)
    } else {
      tl.to(logo, { opacity: 0, scale: 1.1, duration: 0.3 })
        .to(panels, { yPercent: -100, duration: 0.8, stagger: 0.09 }, '-=0.1')
        .add(() => setReady(true), '-=0.55')
    }
  }, [lenis])

  const value = useMemo(() => ({ navigateTo, reveal, setReady, ready }), [navigateTo, reveal, ready])

  return (
    <TransitionContext.Provider value={value}>
      <ReadyContext.Provider value={ready}>
        {children}
        <TransitionLayer ref={layerRef} />
      </ReadyContext.Provider>
    </TransitionContext.Provider>
  )
}

export const useTransition = () => useContext(TransitionContext)
/** true once the preloader is gone and the current page is revealed */
export const useAppReady = () => useContext(ReadyContext)
