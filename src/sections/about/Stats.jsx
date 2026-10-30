import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import Counter from '../../components/Counter'

/** STATS — four big counters that animate on enter */
export default function Stats() {
  const { t } = useTranslation()
  const root = useRef(null)
  const items = t('about.stats.items', { returnObjects: true })
  useSectionColor(root, SECTION.sunny)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      gsap.fromTo(
        q('[data-stat]'),
        { y: prefersReducedMotion() ? 0 : 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'aura', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } },
      )
      gsap.fromTo(q('[data-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'auraInOut', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section relative" aria-label={t('about.stats.eyebrow')}>
      <div className="container-x">
        <p className="eyebrow mb-8">{t('about.stats.eyebrow')}</p>
        <div data-rule className="h-px w-full origin-left mb-10" style={{ background: 'color-mix(in srgb, var(--fg) 25%, transparent)' }} aria-hidden="true" />
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {items.map((s, i) => (
            <div key={i} data-stat className="will-change-transform">
              <dd className="display leading-none whitespace-nowrap" style={{ fontSize: 'clamp(2.75rem, 5.2vw, 6rem)' }}>
                <Counter value={s.value} decimals={s.decimals || 0} suffix={s.suffix || ''} />
              </dd>
              <dt className="mt-4 text-sm md:text-base font-semibold opacity-75 max-w-[14rem]">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
