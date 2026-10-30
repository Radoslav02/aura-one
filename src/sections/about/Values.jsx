import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'

const CARDS = [
  { bg: 'var(--violet)', fg: '#FFF8F0' },
  { bg: 'var(--coral)', fg: '#0E0B16' },
  { bg: 'var(--sunny)', fg: '#0E0B16' },
  { bg: 'var(--ocean)', fg: '#0E0B16' },
]

/**
 * VALUES — sticky stacking cards. Every card sticks below the header; as the
 * next card slides over, the one beneath scales down and darkens (scrubbed).
 */
export default function Values() {
  const { t } = useTranslation()
  const root = useRef(null)
  const items = t('about.values.items', { returnObjects: true })
  useSectionColor(root, SECTION.dark)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const cards = gsap.utils.toArray('[data-stack-card]', root.current)
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        const shade = card.querySelector('[data-shade]')
        gsap.to(card, {
          scale: 0.92 - i * 0.01,
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=' + 80, scrub: true },
        })
        gsap.to(shade, { opacity: 0.55, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=' + 80, scrub: true } })
      })
      // copy reveal inside each card
      cards.forEach((card) => {
        gsap.fromTo(card.querySelectorAll('[data-reveal]'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'aura', scrollTrigger: { trigger: card, start: 'top 70%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative pt-28 pb-12" aria-labelledby="values-title">
      <div className="container-x mb-16">
        <p className="eyebrow mb-4">{t('about.values.eyebrow')}</p>
        <SplitHeading as="h2" id="values-title" className="display display-lg max-w-[16ch]">
          {t('about.values.title')}
        </SplitHeading>
      </div>

      <div className="container-x">
        {items.map((it, i) => (
          <article
            key={i}
            data-stack-card
            className="sticky rounded-[var(--radius)] overflow-hidden will-change-transform origin-top mb-6 md:mb-10 last:mb-0"
            style={{ top: 'calc(var(--header-h) + 1rem)', background: CARDS[i].bg, color: CARDS[i].fg, minHeight: 'min(72vh, 44rem)' }}
          >
            <div data-shade className="absolute inset-0 bg-dark opacity-0 pointer-events-none" aria-hidden="true" />
            <div className="relative h-full p-8 md:p-14 flex flex-col md:flex-row md:items-end justify-between gap-10" style={{ minHeight: 'min(72vh, 44rem)' }}>
              <span data-reveal className="display leading-none opacity-40" style={{ fontSize: 'clamp(5rem, 14vw, 12rem)' }} aria-hidden="true">
                0{i + 1}
              </span>
              <div className="max-w-xl">
                <h3 data-reveal className="display display-md">{it.title}</h3>
                <p data-reveal className="mt-6 text-lg md:text-xl leading-relaxed opacity-90">{it.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
