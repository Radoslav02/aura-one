import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import ExplodedView from '../../scenes/ExplodedView'
import SplitHeading from '../../components/SplitHeading'

/* Label anchors (% of the scene box) + which side the text sits on */
const LABELS = [
  { key: 'headband', x: 50, y: 16, side: 'left', dx: -22, dy: -6 },
  { key: 'cushion', x: 47, y: 60, side: 'left', dx: -24, dy: 14 },
  { key: 'driver', x: 61, y: 57, side: 'right', dx: 16, dy: -16 },
  { key: 'chip', x: 66, y: 54, side: 'right', dx: 18, dy: -32 },
  { key: 'cup', x: 71, y: 63, side: 'right', dx: 13, dy: 16 },
]

/**
 * PINNED 3D SCROLL SCENE — section pins for 300vh; scrub progress drives the
 * model (turn → explode) and the label/connector reveal.
 */
export default function ExplodedScroll() {
  const { t } = useTranslation()
  const root = useRef(null)
  const progress = useRef(0)
  useSectionColor(root, SECTION.deepViolet)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const reduce = prefersReducedMotion()
      const labels = q('[data-label]')
      const lines = q('[data-line]')
      gsap.set(labels, { opacity: 0, y: 10 })
      gsap.set(lines, { drawSVG: '0%' })

      if (reduce) {
        progress.current = 1
        gsap.set(labels, { opacity: 1, y: 0 })
        gsap.set(q('[data-mlabel]'), { opacity: 1 })
        gsap.set(lines, { drawSVG: '100%' })
        return
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            progress.current = self.progress
          },
        },
      })
      // intro copy fades while the model turns, labels draw in during the explode
      tl.to(q('[data-intro]'), { opacity: 0, y: -40, duration: 0.25, ease: 'none' }, 0.1)
      const mlabels = q('[data-mlabel]')
      LABELS.forEach((_, i) => {
        const at = 0.55 + i * 0.07
        tl.to(lines[i], { drawSVG: '100%', duration: 0.12, ease: 'none' }, at)
        tl.to(labels[i], { opacity: 1, y: 0, duration: 0.1, ease: 'none' }, at + 0.06)
        if (mlabels[i]) tl.to(mlabels[i], { opacity: 1, duration: 0.1, ease: 'none' }, at)
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden" aria-labelledby="exploded-title">
      <div className="absolute inset-0">
        <ExplodedView progress={progress} className="w-full h-full" />
      </div>

      {/* intro copy */}
      <div data-intro className="absolute inset-x-0 top-[14vh] md:top-[18vh] pointer-events-none">
        <div className="container-x">
          <p className="eyebrow mb-4">{t('home.exploded.eyebrow')}</p>
          <SplitHeading as="h2" id="exploded-title" className="display display-lg max-w-[14ch]" start="top 95%">
            {t('home.exploded.title')}
          </SplitHeading>
          <p className="lead mt-5">{t('home.exploded.body')}</p>
        </div>
      </div>
      {/* connector lines (drawn with DrawSVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {LABELS.map((l) => (
          <polyline
            key={l.key}
            data-line
            points={`${l.x},${l.y} ${l.x + l.dx * 0.5},${l.y + l.dy} ${l.x + l.dx},${l.y + l.dy}`}
            fill="none"
            stroke="var(--c-accent)"
            strokeWidth="0.25"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1.5 }}
          />
        ))}
      </svg>

      {/* labels */}
      {LABELS.map((l, i) => (
        <div
          key={l.key}
          data-label
          className={`absolute max-w-[14rem] md:max-w-[17rem] hidden md:block ${l.side === 'left' ? 'text-right' : 'text-left'}`}
          style={{
            left: `${l.x + l.dx}%`,
            top: `${l.y + l.dy}%`,
            transform: l.side === 'left' ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
            padding: '0 0.75rem',
          }}
        >
          <span className="block w-2 h-2 rounded-full mb-2" style={{ background: 'var(--c-accent)', marginLeft: l.side === 'left' ? 'auto' : 0 }} />
          <h3 className="font-display font-bold text-sm md:text-base leading-tight">{t(`home.exploded.parts.${l.key}.title`)}</h3>
          <p className="text-xs md:text-sm opacity-75 mt-1 hidden sm:block">{t(`home.exploded.parts.${l.key}.desc`)}</p>
          <span className="sr-only">{i + 1}</span>
        </div>
      ))}

      {/* mobile: compact part list instead of floating callouts */}
      <ul data-mobile-labels className="md:hidden absolute inset-x-0 bottom-6 px-[var(--gutter)] grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold">
        {LABELS.map((l, i) => (
          <li key={l.key} className="flex items-start gap-2 opacity-0" data-mlabel>
            <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-accent)' }} />
            <span>{t(`home.exploded.parts.${l.key}.title`)}</span>
          </li>
        ))}
      </ul>

    </section>
  )
}
