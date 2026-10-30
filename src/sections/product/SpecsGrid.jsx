import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'

const ACCENTS = ['var(--violet)', 'var(--coral)', 'var(--ocean)', 'var(--lime)']

/** SPECS GRID — 2×2 cards; divider lines draw in (scaleX) and rows fade up */
export default function SpecsGrid() {
  const { t } = useTranslation()
  const root = useRef(null)
  const groups = t('product.specs.groups', { returnObjects: true })
  useSectionColor(root, SECTION.light)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray('[data-spec-card]', root.current).forEach((card) => {
        const lines = card.querySelectorAll('[data-line]')
        const rows = card.querySelectorAll('[data-row]')
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%', once: true } })
        tl.from(card, { y: 40, opacity: 0, duration: 0.9, ease: 'aura' })
          .fromTo(lines, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.9, stagger: 0.1, ease: 'auraInOut' }, '-=0.5')
          .fromTo(rows, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'aura' }, '-=0.9')
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section relative" aria-labelledby="specs-title">
      <div className="container-x">
        <div className="max-w-3xl mb-14">
          <p className="eyebrow mb-4">{t('product.specs.eyebrow')}</p>
          <SplitHeading as="h2" id="specs-title" className="display display-lg">
            {t('product.specs.title')}
          </SplitHeading>
        </div>
        <div className="grid md:grid-cols-2 gap-5 md:gap-8">
          {groups.map((g, gi) => (
            <article key={g.title} data-spec-card className="card p-7 md:p-10 relative overflow-hidden will-change-transform" style={{ background: 'color-mix(in srgb, var(--dark) 4%, transparent)' }}>
              <span className="absolute top-0 left-0 w-full h-1.5" style={{ background: ACCENTS[gi % ACCENTS.length] }} aria-hidden="true" />
              <h3 className="display display-sm mb-6 flex items-center gap-3">
                <span className="text-xs font-body font-bold tracking-widest opacity-50">0{gi + 1}</span>
                {g.title}
              </h3>
              <dl>
                {g.rows.map(([k, v]) => (
                  <div key={k} className="relative py-4">
                    <span data-line className="absolute top-0 left-0 w-full h-px" style={{ background: 'color-mix(in srgb, var(--dark) 18%, transparent)' }} aria-hidden="true" />
                    <div data-row className="flex items-baseline justify-between gap-6">
                      <dt className="text-sm font-semibold opacity-60 shrink-0">{k}</dt>
                      <dd className="text-right font-bold">{v}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
