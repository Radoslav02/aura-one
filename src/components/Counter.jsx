import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'

/**
 * Number that counts up when scrolled into view.
 * Renders via ref (not React children) so GSAP can own the text.
 */
export default function Counter({ value, decimals = 0, prefix = '', suffix = '', duration = 1.8, className = '', start = 'top 85%' }) {
  const ref = useRef(null)
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'
  useGSAP(
    () => {
      const obj = { v: 0 }
      const fmt = (n) => prefix + n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
      ref.current.textContent = fmt(0)
      gsap.to(obj, {
        v: value,
        duration,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start, once: true },
        onUpdate: () => {
          ref.current.textContent = fmt(obj.v)
        },
      })
    },
    { scope: ref, dependencies: [value, decimals, prefix, suffix] },
  )
  return <span ref={ref} className={`tabular-nums ${className}`} />
}
