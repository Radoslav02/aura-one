import { gsap, ScrollTrigger, useGSAP } from '../animations/gsap'

/**
 * Smoothly tweens the page background / foreground / cursor colour when a
 * section crosses the middle of the viewport (both directions).
 *
 * usage: useSectionColor(sectionRef, SECTION.coral)
 */
export function useSectionColor(ref, { bg, fg, cursor } = {}) {
  useGSAP(
    () => {
      if (!ref.current || !bg) return
      const apply = () =>
        gsap.to(document.documentElement, {
          '--bg': bg,
          '--fg': fg,
          '--cursor': cursor || fg,
          duration: 0.9,
          ease: 'power2.inOut',
          overwrite: 'auto',
        })
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 55%',
        end: 'bottom 55%',
        onEnter: apply,
        onEnterBack: apply,
      })
    },
    { scope: ref, dependencies: [bg, fg, cursor] },
  )
}

/** Imperative version (used by Page on mount) */
export function setSectionColor({ bg, fg, cursor }, immediate = false) {
  const vars = { '--bg': bg, '--fg': fg, '--cursor': cursor || fg }
  if (immediate) gsap.set(document.documentElement, vars)
  else gsap.to(document.documentElement, { ...vars, duration: 0.8, ease: 'power2.inOut', overwrite: 'auto' })
}
