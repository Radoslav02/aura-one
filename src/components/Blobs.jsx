import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { prefersReducedMotion } from '../hooks/useMedia'

/**
 * Animated gradient blobs for section backgrounds. Colours follow the active
 * colorway via CSS variables. Transform-only animation.
 */
export default function Blobs({ className = '', opacity = 0.6, parallax = true }) {
  const root = useRef(null)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const blobs = root.current.querySelectorAll('[data-blob]')
      blobs.forEach((b, i) => {
        gsap.to(b, {
          x: () => gsap.utils.random(-120, 120),
          y: () => gsap.utils.random(-100, 100),
          scale: () => gsap.utils.random(0.85, 1.25),
          duration: 6 + i * 1.5,
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          ease: 'sine.inOut',
        })
      })
      if (parallax) {
        gsap.to(blobs, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      }
    },
    { scope: root },
  )
  return (
    <div ref={root} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true" style={{ opacity }}>
      <div data-blob className="absolute w-[55vmax] h-[55vmax] rounded-full left-[-10%] top-[-10%]" style={{ background: 'radial-gradient(circle at 30% 30%, var(--c-primary), transparent 60%)', filter: 'blur(40px)' }} />
      <div data-blob className="absolute w-[45vmax] h-[45vmax] rounded-full right-[-10%] top-[10%]" style={{ background: 'radial-gradient(circle at 60% 40%, var(--c-secondary), transparent 60%)', filter: 'blur(50px)' }} />
      <div data-blob className="absolute w-[40vmax] h-[40vmax] rounded-full left-[30%] bottom-[-20%]" style={{ background: 'radial-gradient(circle at 50% 50%, var(--c-accent), transparent 60%)', filter: 'blur(60px)' }} />
    </div>
  )
}
