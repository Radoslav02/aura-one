import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { useLenis } from '../context/LenisContext'
import { prefersReducedMotion } from '../hooks/useMedia'

/**
 * Infinite marquee. The track is duplicated; a seamless xPercent loop runs
 * forever and its timeScale reacts to Lenis scroll velocity + direction.
 */
export default function Marquee({ children, speed = 40, reverse = false, className = '', gap = '2rem', reactive = true }) {
  const root = useRef(null)
  const track = useRef(null)
  const lenis = useLenis()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const el = track.current
      const dir = reverse ? 1 : -1
      const tl = gsap.to(el, { xPercent: dir * 50, duration: speed, ease: 'none', repeat: -1 })
      if (!reactive || !lenis) return
      let current = 1
      const onScroll = ({ velocity, direction }) => {
        const d = direction === 0 ? 1 : direction
        const target = gsap.utils.clamp(-6, 6, d * (1 + Math.min(Math.abs(velocity), 60) / 12))
        if (target !== current) {
          current = target
          gsap.to(tl, { timeScale: target, duration: 0.6, ease: 'power2.out', overwrite: true })
        }
      }
      lenis.on('scroll', onScroll)
      return () => lenis.off('scroll', onScroll)
    },
    { scope: root, dependencies: [lenis, speed, reverse] },
  )

  return (
    <div ref={root} className={`overflow-hidden w-full ${className}`}>
      <div ref={track} className="flex w-max will-change-transform" style={{ gap }}>
        <div className="flex shrink-0" style={{ gap }}>{children}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{children}</div>
      </div>
    </div>
  )
}
