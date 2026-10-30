import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, Draggable, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { isTouchDevice, prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import { IMAGES } from '../../data/assets'
import SplitHeading from '../../components/SplitHeading'
import RevealImage from '../../components/RevealImage'

const RATIOS = ['4 / 5', '3 / 2', '1 / 1', '4 / 5', '3 / 2', '4 / 5']

/**
 * STUDIO GALLERY — horizontal drag scroll (GSAP Draggable + Inertia).
 * Touch devices fall back to native horizontal scrolling.
 */
export default function StudioGallery() {
  const { t } = useTranslation()
  const root = useRef(null)
  const viewport = useRef(null)
  const track = useRef(null)
  const alts = t('about.studio.alts', { returnObjects: true })
  const touch = typeof window !== 'undefined' && isTouchDevice()
  useSectionColor(root, SECTION.coral)

  useGSAP(
    () => {
      if (touch) return
      const bounds = () => ({ minX: Math.min(0, viewport.current.clientWidth - track.current.scrollWidth), maxX: 0 })
      const [drag] = Draggable.create(track.current, {
        type: 'x',
        bounds: bounds(),
        inertia: true,
        edgeResistance: 0.85,
        dragResistance: 0.05,
        cursor: 'none',
        activeCursor: 'none',
        onPress() {
          gsap.to(track.current.querySelectorAll('[data-slide]'), { scale: 0.97, duration: 0.4, ease: 'aura' })
        },
        onRelease() {
          gsap.to(track.current.querySelectorAll('[data-slide]'), { scale: 1, duration: 0.6, ease: 'aura' })
        },
      })
      const onResize = () => drag.applyBounds(bounds())
      window.addEventListener('resize', onResize)

      // slides glide in on entry (opacity/transform only, never x of the track)
      if (!prefersReducedMotion()) {
        gsap.fromTo(track.current.querySelectorAll('[data-slide]'), { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'aura', scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
      }
      return () => {
        window.removeEventListener('resize', onResize)
        drag.kill()
      }
    },
    { scope: root, dependencies: [touch] },
  )

  return (
    <section ref={root} className="section relative overflow-hidden" aria-labelledby="studio-title">
      <div className="container-x flex flex-wrap items-end justify-between gap-6 mb-12">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">{t('about.studio.eyebrow')}</p>
          <SplitHeading as="h2" id="studio-title" className="display display-lg">
            {t('about.studio.title')}
          </SplitHeading>
        </div>
        <p className="text-xs font-bold tracking-widest uppercase opacity-70 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 12H3m0 0 3-3m-3 3 3 3M16 12h5m0 0-3-3m3 3-3 3" /></svg>
          {t('about.studio.hint')}
        </p>
      </div>

      <div ref={viewport} className={`w-full ${touch ? 'overflow-x-auto snap-x snap-mandatory no-scrollbar' : 'overflow-hidden'}`} data-cursor="drag">
        <div ref={track} className="flex gap-5 md:gap-8 px-[var(--gutter)] w-max will-change-transform select-none">
          {IMAGES.studio.map((id, i) => (
            <div key={id} data-slide className="snap-center shrink-0 w-[72vw] sm:w-[48vw] md:w-[34vw] lg:w-[26vw] will-change-transform">
              <RevealImage id={id} alt={alts[i] || ''} ratio={RATIOS[i]} sizes="(max-width: 768px) 72vw, 30vw" direction="left" imgClassName="pointer-events-none" draggable={false} />
              <p className="mt-3 text-sm font-semibold opacity-80">{String(i + 1).padStart(2, '0')} — {alts[i]}</p>
            </div>
          ))}
          <div className="shrink-0 w-[4vw]" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
