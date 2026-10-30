import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useAppReady } from '../../context/TransitionContext'
import { useLenis } from '../../context/LenisContext'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import Hero3D from '../../scenes/Hero3D'
import SplitHeading from '../../components/SplitHeading'
import MagneticButton, { ArrowIcon } from '../../components/MagneticButton'
import Blobs from '../../components/Blobs'

const SHAPES = [
  { cls: 'left-[8%] top-[22%] w-16 h-16 rounded-full', bg: 'var(--coral)', speed: 2 },
  { cls: 'right-[12%] top-[18%] w-10 h-10 rotate-12', bg: 'var(--lime)', speed: 3, radius: '30%' },
  { cls: 'left-[14%] bottom-[22%] w-8 h-8 rounded-full', bg: 'var(--sunny)', speed: 1.5 },
  { cls: 'right-[8%] bottom-[28%] w-20 h-20 rounded-full', bg: 'var(--ocean)', speed: 2.5 },
  { cls: 'left-[42%] top-[12%] w-6 h-6', bg: 'var(--light)', speed: 4, radius: '40%' },
]

/**
 * HERO — full-screen 3D model over an animated gradient, letter-by-letter
 * headline, parallax floating shapes, scroll hint.
 */
export default function Hero() {
  const { t } = useTranslation()
  const root = useRef(null)
  const ready = useAppReady()
  const lenis = useLenis()
  useSectionColor(root, SECTION.dark)

  useGSAP(
    () => {
      if (!ready) return
      const q = gsap.utils.selector(root)
      const reduce = prefersReducedMotion()
      const tl = gsap.timeline({ defaults: { ease: 'aura' } })
      tl.set(q('[data-hero-content]'), { visibility: 'visible' })
      tl.fromTo(q('[data-hero-canvas]'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.6 }, 0)
        .fromTo(q('[data-hero-fade]'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.6)
        .fromTo(q('[data-shape]'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, stagger: 0.08, ease: 'auraBack' }, 0.9)

      if (reduce) return
      // floating shapes: idle bob + pointer parallax + scroll parallax
      q('[data-shape]').forEach((el, i) => {
        gsap.to(el, { y: `+=${12 + i * 4}`, duration: 2 + i * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      })
      const xTos = q('[data-shape]').map((el) => gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }))
      const yTos = q('[data-shape]').map((el) => gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }))
      const move = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        SHAPES.forEach((s, i) => {
          xTos[i](nx * 40 * s.speed)
          yTos[i](ny * 40 * s.speed)
        })
      }
      window.addEventListener('mousemove', move, { passive: true })

      // content drifts up & fades as you leave the hero
      gsap.to(q('[data-hero-content]'), {
        yPercent: -20,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to(q('[data-hero-canvas]'), {
        yPercent: 25,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      return () => window.removeEventListener('mousemove', move)
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section ref={root} className="relative min-h-[100svh] overflow-hidden flex items-end md:items-center" aria-labelledby="hero-title">
      <Blobs opacity={0.75} />
      {/* 3D */}
      <div data-hero-canvas className="absolute inset-0 md:left-[38%] opacity-0 will-change-transform">
        <Hero3D className="w-full h-full" />
      </div>
      {/* floating shapes */}
      {SHAPES.map((s, i) => (
        <span key={i} data-shape aria-hidden="true" className={`absolute ${s.cls} opacity-0 will-change-transform`} style={{ background: s.bg, borderRadius: s.radius, boxShadow: `0 0 40px ${s.bg}` }} />
      ))}

      <div data-hero-content className="container-x relative z-10 pb-24 pt-32 md:pt-40 md:pb-32 will-change-transform" style={{ visibility: 'hidden' }}>
        <p data-hero-fade className="eyebrow mb-6 opacity-0">
          {t('home.hero.eyebrow')}
        </p>
        <SplitHeading as="h1" id="hero-title" type="chars" immediate delay={0.3} className="display display-xl max-w-[12ch]">
          {t('home.hero.title')}
        </SplitHeading>
        <p data-hero-fade className="lead mt-8 opacity-0">
          {t('home.hero.subtitle')}
        </p>
        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4 opacity-0">
          <MagneticButton to="/contact" variant="primary" icon={<ArrowIcon />}>
            {t('home.hero.cta')}
          </MagneticButton>
          <MagneticButton
            href="#film"
            variant="outline"
            data-cursor="play"
            onClick={(e) => {
              e.preventDefault()
              lenis ? lenis.scrollTo('#film', { offset: -24, duration: 1.6 }) : document.getElementById('film')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {t('home.hero.ctaSecondary')}
          </MagneticButton>
        </div>
        <ul data-hero-fade className="mt-12 flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold opacity-0" aria-label="Highlights">
          {['badge1', 'badge2', 'badge3'].map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-accent)' }} />
              {t(`home.hero.${k}`)}
            </li>
          ))}
        </ul>
      </div>

      <div data-hero-fade className="absolute bottom-6 right-[var(--gutter)] hidden md:flex items-center gap-3 text-xs font-bold tracking-widest uppercase opacity-0">
        <span>{t('home.hero.scroll')}</span>
        <span className="relative w-6 h-10 rounded-full border border-current/40 overflow-hidden">
          <span className="absolute left-1/2 top-2 -translate-x-1/2 w-1 h-2 rounded-full bg-current animate-bounce" />
        </span>
      </div>
    </section>
  )
}
