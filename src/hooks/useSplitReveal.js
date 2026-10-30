import { useTranslation } from 'react-i18next'
import { gsap, SplitText, useGSAP } from '../animations/gsap'
import { prefersReducedMotion } from './useMedia'
import { useAppReady } from '../context/TransitionContext'

/**
 * Splits the element's text (lines + words [+ chars]) and reveals it from a
 * line mask when it enters the viewport.
 *
 * IMPORTANT: the element must be re-mounted when the language changes
 * (render it with key={i18n.language}) — <SplitHeading> does this for you.
 * autoSplit re-splits on resize / font load and re-creates the tween.
 *
 * Options:
 *  type: 'words' | 'chars' | 'lines'   what to animate
 *  stagger, duration, delay           timing
 *  start                              ScrollTrigger start (default 'top 88%')
 *  immediate                          play on mount instead of on scroll (hero)
 *  waitForReady                       wait for preloader / page transition
 */
export function useSplitReveal(
  ref,
  {
    type = 'words',
    stagger,
    duration = 1.1,
    delay = 0,
    start = 'top 88%',
    immediate = false,
    waitForReady = true,
    ease = 'aura',
    enabled = true,
  } = {},
) {
  const { i18n } = useTranslation()
  const ready = useAppReady()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || !enabled) return
      if (waitForReady && !ready) return

      if (prefersReducedMotion()) {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, delay, scrollTrigger: immediate ? undefined : { trigger: el, start, once: true } })
        return
      }

      const splitType = type === 'chars' ? 'lines,words,chars' : 'lines,words'
      const split = SplitText.create(el, {
        type: splitType,
        mask: 'lines',
        linesClass: 'line',
        wordsClass: 'word',
        charsClass: 'char',
        autoSplit: true,
        onSplit(self) {
          const targets = type === 'chars' ? self.chars : type === 'lines' ? self.lines : self.words
          const st = type === 'chars' ? 0.025 : type === 'lines' ? 0.12 : 0.04
          return gsap.from(targets, {
            yPercent: 115,
            rotate: type === 'lines' ? 0 : 4,
            duration,
            delay,
            ease,
            stagger: stagger ?? st,
            scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
          })
        },
      })
      return () => split.revert()
    },
    { scope: ref, dependencies: [ready, i18n.language, enabled, immediate], revertOnUpdate: true },
  )
}
