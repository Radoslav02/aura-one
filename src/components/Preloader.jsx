import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../animations/gsap'
import { useLenis } from '../context/LenisContext'
import { useTransition } from '../context/TransitionContext'
import { prefersReducedMotion } from '../hooks/useMedia'

const LETTERS = ['A', 'U', 'R', 'A']
const CURTAINS = ['var(--violet)', 'var(--coral)', 'var(--lime)', 'var(--ocean)']

/**
 * Preloader: 0→100 counter, morphing colour blobs, logo assembling from
 * letters, then a multi-colour curtain wipe. Signals `ready` to the app and
 * starts Lenis when done. Runs once per page load.
 */
export default function Preloader() {
  const root = useRef(null)
  const counter = useRef(null)
  const lenis = useLenis()
  const { setReady } = useTransition()
  const { t } = useTranslation()
  const [done, setDone] = useState(false)

  useGSAP(
    () => {
      if (!lenis || done) return
      const q = gsap.utils.selector(root)
      const reduce = prefersReducedMotion()
      const letters = q('[data-letter]')
      const blobs = q('[data-blob]')
      const curtains = q('[data-curtain]')
      const stage = q('[data-stage]')
      const progress = { v: 0 }

      const finish = () => {
        setReady(true)
        lenis.start()
      }

      if (reduce) {
        gsap.to(root.current, { opacity: 0, duration: 0.5, delay: 0.3, onComplete: () => { finish(); setDone(true) } })
        return
      }

      // blobs drift & morph the whole time
      blobs.forEach((b, i) => {
        gsap.to(b, {
          x: () => gsap.utils.random(-120, 120),
          y: () => gsap.utils.random(-80, 80),
          scale: () => gsap.utils.random(0.8, 1.4),
          borderRadius: () => `${gsap.utils.random(35, 65)}% ${gsap.utils.random(35, 65)}% ${gsap.utils.random(35, 65)}% ${gsap.utils.random(35, 65)}%`,
          duration: 1.4 + i * 0.2,
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          ease: 'sine.inOut',
        })
      })

      const tl = gsap.timeline({
        defaults: { ease: 'aura' },
        onComplete: () => setDone(true),
      })
      tl.set(curtains, { yPercent: 100 })
        .set(root.current, { autoAlpha: 1 })
        .add(() => (document.fonts?.ready || Promise.resolve()).then(() => gsap.set(stage, { visibility: 'visible' })))
        // letters fly in from random positions and assemble the logo
        .from(letters, {
          x: () => gsap.utils.random(-300, 300),
          y: () => gsap.utils.random(-200, 200),
          rotate: () => gsap.utils.random(-90, 90),
          scale: 0.2,
          opacity: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: 'auraBack',
        })
        // counter 0 → 100
        .to(
          progress,
          {
            v: 100,
            duration: 1.9,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (counter.current) counter.current.textContent = String(Math.round(progress.v)).padStart(3, '0')
            },
          },
          0.2,
        )
        // wait for webfonts so the hero splits correctly
        .add(() => document.fonts?.ready, '>-0.1')
        // logo pops & everything lifts
        .to(letters, { yPercent: -120, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power3.in' })
        .to(q('[data-counter-wrap]'), { yPercent: 60, opacity: 0, duration: 0.5, ease: 'power3.in' }, '<')
        .to(blobs, { scale: 0, opacity: 0, duration: 0.5, ease: 'power3.in' }, '<')
        // curtains sweep up and cover, stage disappears, then curtains leave upward
        .to(curtains, { yPercent: 0, duration: 0.7, stagger: 0.08, ease: 'auraInOut' }, '-=0.3')
        .set(stage, { autoAlpha: 0 })
        .add(finish)
        .to(curtains, { yPercent: -100, duration: 0.8, stagger: 0.08, ease: 'auraInOut' }, '+=0.05')
    },
    { scope: root, dependencies: [lenis] },
  )

  if (done) return null

  return (
    <div ref={root} className="fixed inset-0 z-[9700] overflow-hidden" aria-live="polite" aria-label={t('preloader.label')}>
      {/* stage */}
      <div data-stage className="absolute inset-0 bg-dark text-light" style={{ visibility: 'hidden' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div data-blob className="absolute left-[20%] top-[30%] w-[40vmin] h-[40vmin] rounded-full opacity-80" style={{ background: 'var(--violet)', filter: 'blur(40px)' }} />
          <div data-blob className="absolute left-[55%] top-[25%] w-[35vmin] h-[35vmin] rounded-full opacity-80" style={{ background: 'var(--coral)', filter: 'blur(40px)' }} />
          <div data-blob className="absolute left-[40%] top-[55%] w-[30vmin] h-[30vmin] rounded-full opacity-80" style={{ background: 'var(--lime)', filter: 'blur(40px)' }} />
          <div data-blob className="absolute left-[65%] top-[60%] w-[28vmin] h-[28vmin] rounded-full opacity-70" style={{ background: 'var(--ocean)', filter: 'blur(40px)' }} />
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <div className="display flex" style={{ fontSize: 'clamp(4rem, 16vw, 14rem)' }} aria-hidden="true">
            {LETTERS.map((l, i) => (
              <span key={i} data-letter className="inline-block will-change-transform">
                {l}
              </span>
            ))}
          </div>
        </div>
        <div data-counter-wrap className="absolute bottom-[6vh] left-[var(--gutter)] right-[var(--gutter)] flex items-end justify-between">
          <span className="eyebrow">{t('preloader.label')}</span>
          <span className="display tabular-nums" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
            <span ref={counter}>000</span>
            <span className="text-lime">%</span>
          </span>
        </div>
      </div>
      {/* curtains */}
      {CURTAINS.map((c, i) => (
        <div key={i} data-curtain className="absolute inset-0" style={{ background: c }} />
      ))}
    </div>
  )
}
