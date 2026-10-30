import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'
import Counter from '../../components/Counter'

const FEATURES = [
  { key: 'battery', bg: 'var(--violet)', fg: '#FFF8F0' },
  { key: 'spatial', bg: 'var(--coral)', fg: '#0E0B16' },
  { key: 'comfort', bg: 'var(--sunny)', fg: '#0E0B16' },
  { key: 'materials', bg: 'var(--ocean)', fg: '#0E0B16' },
]

/* Animated icons: each returns an SVG whose parts carry data-icon-* hooks */
const Icons = {
  battery: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="20" width="46" height="24" rx="6" />
      <path d="M56 28v8" />
      <rect data-icon-fill x="12" y="26" width="34" height="12" rx="3" fill="currentColor" stroke="none" style={{ transformOrigin: '12px 32px' }} />
    </svg>
  ),
  spatial: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="32" cy="32" r="5" fill="currentColor" stroke="none" />
      <circle data-icon-ring cx="32" cy="32" r="13" style={{ transformOrigin: '32px 32px' }} />
      <circle data-icon-ring cx="32" cy="32" r="21" style={{ transformOrigin: '32px 32px' }} />
      <circle data-icon-ring cx="32" cy="32" r="29" style={{ transformOrigin: '32px 32px' }} />
    </svg>
  ),
  comfort: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path data-icon-feather d="M50 12c-18 2-30 14-34 34 18-2 30-14 34-34z" />
      <path data-icon-feather d="M16 48 44 20M26 38h10M22 30l8 8" />
    </svg>
  ),
  materials: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path data-icon-leaf d="M12 52C12 30 28 14 54 12c-2 26-18 42-42 40z" />
      <path data-icon-leaf d="M12 52 42 22" />
    </svg>
  ),
}

/**
 * HORIZONTAL SCROLL FEATURES — desktop: section pins and vertical scroll
 * drives the track sideways; mobile: native swipe slider with scroll-snap.
 */
export default function HorizontalFeatures() {
  const { t } = useTranslation()
  const root = useRef(null)
  const track = useRef(null)
  useSectionColor(root, SECTION.light)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const getDistance = () => track.current.scrollWidth - window.innerWidth
        const tween = gsap.to(track.current, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        // cards tilt slightly as they travel
        q('[data-card]').forEach((card) => {
          gsap.fromTo(
            card,
            { rotate: 3, y: 40 },
            { rotate: -3, y: -40, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
          )
        })
        return () => tween.scrollTrigger?.kill()
      })

      // icon animations (both layouts)
      gsap.fromTo(q('[data-icon-fill]'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: q('[data-card]')[0], start: 'top 80%', once: true } })
      gsap.fromTo(q('[data-icon-ring]'), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, stagger: 0.2, repeat: -1, repeatDelay: 0.6, ease: 'power2.out' })
      gsap.fromTo(q('[data-icon-feather]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: 'power2.inOut', repeat: -1, yoyo: true, repeatDelay: 0.8 })
      gsap.fromTo(q('[data-icon-leaf]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.8, ease: 'power2.inOut', repeat: -1, yoyo: true, repeatDelay: 1 })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative md:h-[100svh] overflow-hidden" aria-labelledby="features-title">
      <div className="container-x pt-24 pb-6 md:pb-0 md:absolute md:top-0 md:left-0 md:right-0 md:pt-20 z-10 pointer-events-none">
        <p className="eyebrow mb-4">{t('home.features.eyebrow')}</p>
        <SplitHeading as="h2" id="features-title" className="display display-lg">
          {t('home.features.title')}
        </SplitHeading>
      </div>

      <div ref={track} className="flex gap-5 md:gap-8 px-[var(--gutter)] md:h-full md:items-end md:pb-[8vh] overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar will-change-transform">
        {/* spacer so the first card starts right of the heading on desktop */}
        <div className="hidden md:block shrink-0 w-[28vw]" aria-hidden="true" />
        {FEATURES.map((f) => {
          const item = t(`home.features.items.${f.key}`, { returnObjects: true })
          return (
            <article
              key={f.key}
              data-card
              className="snap-center shrink-0 w-[82vw] sm:w-[60vw] md:w-[34vw] lg:w-[28vw] min-h-[60vh] md:h-[62vh] rounded-[var(--radius)] p-7 md:p-9 flex flex-col justify-between will-change-transform"
              style={{ background: f.bg, color: f.fg }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20">{Icons[f.key]}</div>
              <div>
                <p className="display leading-none" style={{ fontSize: 'clamp(3.5rem, 7vw, 6.5rem)' }}>
                  <Counter value={item.value} />
                  <span className="text-[0.45em] ml-1 align-top">{item.unit}</span>
                </p>
                <p className="text-sm font-semibold opacity-90 mt-1">{item.label}</p>
                <h3 className="display display-sm mt-8">{item.title}</h3>
                <p className="mt-3 leading-relaxed">{item.desc}</p>
              </div>
            </article>
          )
        })}
        <div className="hidden md:block shrink-0 w-[8vw]" aria-hidden="true" />
      </div>
      <p className="md:hidden container-x pb-16 text-xs font-bold tracking-widest uppercase opacity-60">{t('home.features.swipeHint')} →</p>
    </section>
  )
}
