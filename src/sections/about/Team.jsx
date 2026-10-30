import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { isTouchDevice, prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import { IMAGES, srcset, unsplash } from '../../data/assets'
import SplitHeading from '../../components/SplitHeading'

const ACCENTS = ['var(--violet)', 'var(--coral)', 'var(--ocean)', 'var(--sunny)', 'var(--lime)', 'var(--violet)']

/**
 * TEAM — portrait cards that tilt in 3D toward the cursor; hovering slides
 * up a panel with role + fun fact.
 */
export default function Team() {
  const { t } = useTranslation()
  const root = useRef(null)
  const members = t('about.team.members', { returnObjects: true })
  useSectionColor(root, SECTION.light)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const cards = q('[data-card]')
      const reduce = prefersReducedMotion()

      gsap.fromTo(
        cards,
        { y: reduce ? 0 : 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'aura', scrollTrigger: { trigger: q('[data-grid]')[0], start: 'top 80%', once: true } },
      )

      if (isTouchDevice() || reduce) return
      const cleanups = cards.map((card) => {
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' })
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' })
        const img = card.querySelector('img')
        const ix = gsap.quickTo(img, 'x', { duration: 0.9, ease: 'power3' })
        const iy = gsap.quickTo(img, 'y', { duration: 0.9, ease: 'power3' })
        const panel = card.querySelector('[data-panel]')
        const move = (e) => {
          const r = card.getBoundingClientRect()
          const nx = (e.clientX - r.left) / r.width - 0.5
          const ny = (e.clientY - r.top) / r.height - 0.5
          ry(nx * 16)
          rx(-ny * 16)
          ix(nx * -14)
          iy(ny * -14)
        }
        const enter = () => {
          gsap.to(card, { scale: 1.03, duration: 0.6, ease: 'aura' })
          gsap.to(panel, { yPercent: 0, duration: 0.7, ease: 'aura' })
          gsap.to(panel.children, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.1, ease: 'aura' })
        }
        const leave = () => {
          rx(0)
          ry(0)
          ix(0)
          iy(0)
          gsap.to(card, { scale: 1, duration: 0.8, ease: 'aura' })
          gsap.to(panel, { yPercent: 100, duration: 0.6, ease: 'auraInOut' })
          gsap.to(panel.children, { y: 12, opacity: 0, duration: 0.3 })
        }
        gsap.set(panel, { yPercent: 100 })
        gsap.set(panel.children, { y: 12, opacity: 0 })
        card.addEventListener('mousemove', move)
        card.addEventListener('mouseenter', enter)
        card.addEventListener('mouseleave', leave)
        return () => {
          card.removeEventListener('mousemove', move)
          card.removeEventListener('mouseenter', enter)
          card.removeEventListener('mouseleave', leave)
        }
      })
      return () => cleanups.forEach((fn) => fn())
    },
    { scope: root },
  )

  const touch = typeof window !== 'undefined' && isTouchDevice()

  return (
    <section ref={root} className="section relative" aria-labelledby="team-title">
      <div className="container-x">
        <div className="max-w-3xl mb-16">
          <p className="eyebrow mb-4">{t('about.team.eyebrow')}</p>
          <SplitHeading as="h2" id="team-title" className="display display-lg">
            {t('about.team.title')}
          </SplitHeading>
        </div>

        <ul data-grid className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" style={{ perspective: '1400px' }}>
          {members.map((m, i) => (
            <li key={m.name} data-card className="relative rounded-[var(--radius)] overflow-hidden will-change-transform bg-dark text-light" style={{ transformStyle: 'preserve-3d', aspectRatio: '4 / 5' }} data-cursor="view" tabIndex={0}>
              <img
                src={unsplash(IMAGES.team[i], 900)}
                srcSet={srcset(IMAGES.team[i], [480, 768, 1200])}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                alt={m.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-[-7%] w-[114%] h-[114%] max-w-none object-cover will-change-transform"
              />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 45%, rgba(14,11,22,0.85))' }} />
              <span className="absolute top-5 left-5 w-3 h-3 rounded-full" style={{ background: ACCENTS[i % ACCENTS.length], boxShadow: `0 0 18px ${ACCENTS[i % ACCENTS.length]}` }} aria-hidden="true" />

              {/* resting label */}
              <div className="absolute left-6 right-6 bottom-6">
                <h3 className="display display-sm">{m.name}</h3>
                <p className="text-sm opacity-75 mt-1">{m.role}</p>
              </div>

              {/* sliding panel (always visible on touch) */}
              <div data-panel className={`absolute inset-x-0 bottom-0 p-6 pt-8 text-dark will-change-transform ${touch ? 'relative mt-auto' : ''}`} style={{ background: ACCENTS[i % ACCENTS.length], transform: touch ? 'none' : undefined }}>
                <p className="eyebrow !text-[0.65rem] mb-2" style={{ color: 'inherit' }}>{m.role}</p>
                <p className="text-xs font-bold tracking-widest uppercase opacity-60">{t('about.team.hover')}</p>
                <p className="font-semibold leading-snug mt-1">{m.fact}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
