import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import { IMAGES } from '../../data/assets'
import SplitHeading from '../../components/SplitHeading'
import RevealImage from '../../components/RevealImage'

/**
 * TIMELINE — vertical brand story. A centre line fills as you scroll
 * (scaleY scrub), dots light up when their item is active and each year
 * counts up (without thousands separators) when it enters the viewport.
 */
export default function Timeline() {
  const { t } = useTranslation()
  const root = useRef(null)
  const items = t('about.timeline.items', { returnObjects: true })
  useSectionColor(root, SECTION.deepViolet)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const reduce = prefersReducedMotion()

      // progress line
      gsap.fromTo(
        q('[data-line]'),
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: q('[data-list]')[0], start: 'top 60%', end: 'bottom 60%', scrub: reduce ? false : 0.5 } },
      )

      q('[data-item]').forEach((item, i) => {
        const dot = item.querySelector('[data-dot]')
        const year = item.querySelector('[data-year]')
        const copy = item.querySelector('[data-copy]')
        const target = Number(year.dataset.value)
        const counter = { v: Math.max(0, target - 14) }
        year.textContent = String(Math.round(counter.v))

        // dot lights up while item is in the active zone
        gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 60%', end: 'bottom 60%', toggleActions: 'play reverse play reverse' } })
          .to(dot, { scale: 1.6, duration: 0.4, ease: 'auraBack' }, 0)
          .to(dot.firstElementChild, { opacity: 1, duration: 0.3 }, 0)

        // year count-up + copy reveal
        gsap.to(counter, {
          v: target,
          duration: reduce ? 0 : 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 80%', once: true },
          onUpdate: () => {
            year.textContent = String(Math.round(counter.v))
          },
        })
        gsap.fromTo(
          copy.children,
          { y: reduce ? 0 : 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'aura', scrollTrigger: { trigger: item, start: 'top 80%', once: true } },
        )
        if (!reduce) {
          gsap.fromTo(year, { xPercent: i % 2 ? 6 : -6 }, { xPercent: i % 2 ? -6 : 6, ease: 'none', scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true } })
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section relative overflow-hidden" aria-labelledby="timeline-title">
      <div className="container-x">
        <div className="max-w-3xl mb-20">
          <p className="eyebrow mb-4">{t('about.timeline.eyebrow')}</p>
          <SplitHeading as="h2" id="timeline-title" className="display display-lg">
            {t('about.timeline.title')}
          </SplitHeading>
        </div>

        <div data-list className="relative">
          {/* track + fill */}
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: 'color-mix(in srgb, var(--fg) 15%, transparent)' }} aria-hidden="true" />
          <div data-line className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 origin-top will-change-transform" style={{ background: 'linear-gradient(180deg, var(--c-accent), var(--c-secondary))', boxShadow: '0 0 18px var(--c-accent)' }} aria-hidden="true" />

          <ol className="flex flex-col gap-16 md:gap-24">
            {items.map((it, i) => {
              const flip = i % 2 === 1
              return (
                <li key={it.year} data-item className="relative grid md:grid-cols-2 gap-8 md:gap-20 items-center pl-14 md:pl-0">
                  {/* dot */}
                  <span data-dot className="absolute left-5 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full grid place-items-center" style={{ background: 'var(--bg)', border: '2px solid var(--c-accent)' }} aria-hidden="true">
                    <span className="w-2 h-2 rounded-full opacity-0" style={{ background: 'var(--c-accent)', boxShadow: '0 0 16px var(--c-accent)' }} />
                  </span>

                  <div className={`${flip ? 'md:order-2 md:pl-6' : 'md:order-1 md:pr-6 md:text-right'}`}>
                    <p data-year data-value={it.year} className="display leading-none tabular-nums will-change-transform" style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', color: 'var(--c-accent)' }} aria-label={String(it.year)}>
                      {it.year}
                    </p>
                    <div data-copy className={`mt-4 ${flip ? '' : 'md:ml-auto'} max-w-md`}>
                      <h3 className="display display-sm">{it.title}</h3>
                      <p className="lead !text-base md:!text-lg mt-3">{it.text}</p>
                    </div>
                  </div>

                  <div className={`${flip ? 'md:order-1 md:pr-6' : 'md:order-2 md:pl-6'}`}>
                    <RevealImage id={IMAGES.timeline[i]} alt={it.alt} ratio="4 / 3" parallax={6} direction={flip ? 'right' : 'left'} sizes="(max-width: 768px) 90vw, 45vw" className="max-w-xl" data-cursor-blend />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
