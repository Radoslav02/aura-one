import { forwardRef, useEffect } from 'react'
import { gsap } from '../animations/gsap'

/** Stacked colour panels + logo used by the page transition */
const TransitionLayer = forwardRef(function TransitionLayer(_, ref) {
  // initial off-screen state is set with GSAP (inline CSS transforms confuse its cache)
  useEffect(() => {
    if (ref?.current) gsap.set(ref.current.querySelectorAll('[data-panel]'), { yPercent: 100 })
  }, [ref])
  return (
    <div ref={ref} aria-hidden="true" className="fixed inset-0 z-[9500] pointer-events-none overflow-hidden">
      <div data-panel className="absolute inset-0" style={{ background: 'var(--violet)' }} />
      <div data-panel className="absolute inset-0" style={{ background: 'var(--coral)' }} />
      <div data-panel className="absolute inset-0" style={{ background: 'var(--lime)' }} />
      <div data-panel className="absolute inset-0" style={{ background: 'var(--dark)' }} />
      <div data-logo className="absolute inset-0 grid place-items-center opacity-0">
        <span className="display text-light" style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}>
          AURA
        </span>
      </div>
    </div>
  )
})

export default TransitionLayer
