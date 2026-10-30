import { gsap, useGSAP } from '../animations/gsap'
import { isTouchDevice, prefersReducedMotion } from './useMedia'

/**
 * Magnetic hover: the element (and an optional inner child marked with
 * [data-magnetic-inner]) is pulled toward the pointer and snaps back
 * elastically on leave. Transform-only → cheap.
 */
export function useMagnetic(ref, { strength = 0.35, innerStrength = 0.15, enabled = true } = {}) {
  useGSAP(
    () => {
      const el = ref.current
      if (!el || !enabled || isTouchDevice() || prefersReducedMotion()) return
      const inner = el.querySelector('[data-magnetic-inner]')
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' })
      const ixTo = inner && gsap.quickTo(inner, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' })
      const iyTo = inner && gsap.quickTo(inner, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' })

      const move = (e) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        xTo(dx * strength)
        yTo(dy * strength)
        ixTo?.(dx * innerStrength)
        iyTo?.(dy * innerStrength)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
        ixTo?.(0)
        iyTo?.(0)
      }
      el.addEventListener('mousemove', move)
      el.addEventListener('mouseleave', leave)
      return () => {
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseleave', leave)
      }
    },
    { scope: ref, dependencies: [enabled, strength] },
  )
}
