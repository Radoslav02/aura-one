import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import { VIDEOS } from '../../data/assets'
import SplitHeading from '../../components/SplitHeading'
import Counter from '../../components/Counter'
import { useLazyVideo } from '../../hooks/useLazyVideo'

const WAVES = [
  { color: 'var(--coral)', freq: 5, phase: 0, amp: 1 },
  { color: 'var(--lime)', freq: 8, phase: 1.3, amp: 0.8 },
  { color: 'var(--sunny)', freq: 3.5, phase: 2.1, amp: 0.9 },
  { color: 'var(--ocean)', freq: 11, phase: 0.6, amp: 0.6 },
  { color: 'var(--violet)', freq: 6.5, phase: 3.2, amp: 0.7 },
]
const POINTS = 90

/** Builds an SVG path for a sine-ish wave; amp 0 → flat line */
function wavePath(w, amp, time) {
  const pts = []
  for (let i = 0; i <= POINTS; i++) {
    const x = (i / POINTS) * 100
    const y = 50 + Math.sin((i / POINTS) * Math.PI * 2 * w.freq + w.phase + time) * 24 * w.amp * amp + Math.sin((i / POINTS) * Math.PI * 2 * w.freq * 2.7 + time * 1.7) * 8 * amp
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return 'M' + pts.join(' L')
}

/**
 * NOISE CANCELLATION — pinned. The city video desaturates & blurs as you
 * scroll while chaotic colourful waves flatten into one calm line.
 */
export default function NoiseScene() {
  const { t } = useTranslation()
  const root = useRef(null)
  const video = useRef(null)
  const paths = useRef([])
  const state = useMemo(() => ({ amp: 1, time: 0 }), [])
  useSectionColor(root, SECTION.navy)
  useLazyVideo(video, VIDEOS.city.src, { autoplay: true })

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const reduce = prefersReducedMotion()

      // continuous wiggle; amplitude is scrubbed by scroll
      const tick = () => {
        state.time += 0.04
        paths.current.forEach((p, i) => p && p.setAttribute('d', wavePath(WAVES[i], state.amp, state.time)))
      }
      gsap.ticker.add(tick)

      if (reduce) {
        gsap.to(state, { amp: 0, duration: 1.5, scrollTrigger: { trigger: root.current, start: 'top 60%', once: true } })
        return () => gsap.ticker.remove(tick)
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=200%', pin: true, scrub: 0.8, anticipatePin: 1 },
      })
      tl.to(state, { amp: 0, ease: 'power2.inOut', duration: 1 }, 0)
        .to(video.current, { filter: 'grayscale(1) blur(14px) brightness(0.45)', scale: 1.08, ease: 'none', duration: 1 }, 0)
        .fromTo(q('[data-after]'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.6)
        .to(q('[data-before]'), { opacity: 0, duration: 0.3 }, 0.6)
        .fromTo(q('[data-copy]'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4 }, 0.55)
      return () => gsap.ticker.remove(tick)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-dark text-light" aria-labelledby="noise-title">
      {/* PLACEHOLDER VIDEO: Pexels city aerial — replace in /src/data/assets.js */}
      <video ref={video} className="absolute inset-0 w-full h-full object-cover will-change-transform" poster={VIDEOS.city.poster} autoPlay muted loop playsInline preload="none" aria-label={t('a11y.videoCity')} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,11,22,0.35), rgba(14,11,22,0.75))' }} />

      {/* waves */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {WAVES.map((w, i) => (
          <path key={i} ref={(el) => (paths.current[i] = el)} d={wavePath(w, 1, 0)} fill="none" stroke={w.color} strokeWidth="0.5" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3, mixBlendMode: 'screen', opacity: 0.95 }} />
        ))}
      </svg>

      <div className="container-x relative h-full flex flex-col justify-between py-28">
        <div className="flex justify-between text-xs font-bold tracking-widest uppercase">
          <span data-before>{t('home.noise.before')}</span>
          <span data-after className="opacity-0 text-lime">{t('home.noise.after')}</span>
        </div>
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-4">{t('home.noise.eyebrow')}</p>
            <SplitHeading as="h2" id="noise-title" className="display display-xl" start="top 95%">
              {t('home.noise.title')}
            </SplitHeading>
          </div>
          <div data-copy className="md:col-span-4 opacity-0">
            <p className="lead !text-base md:!text-lg">{t('home.noise.body')}</p>
            <p className="mt-6 display display-md text-lime">
              -<Counter value={Number(t('home.noise.stat'))} start="top 100%" />
              <span className="text-2xl ml-1">{t('home.noise.statUnit')}</span>
            </p>
            <p className="text-sm opacity-70">{t('home.noise.statLabel')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
