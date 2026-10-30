import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useAppReady } from '../../context/TransitionContext'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'
import Blobs from '../../components/Blobs'

/** ABOUT HERO — big typographic opener over animated blobs */
export default function AboutHero() {
  const { t } = useTranslation()
  const root = useRef(null)
  const ready = useAppReady()
  useSectionColor(root, SECTION.dark)

  useGSAP(
    () => {
      if (!ready) return
      const q = gsap.utils.selector(root)
      gsap.fromTo(q('[data-fade]'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12, delay: 0.5, ease: 'aura' })
      if (prefersReducedMotion()) return
      gsap.to(q('[data-hero-inner]'), {
        yPercent: -15,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section ref={root} className="relative min-h-[90svh] overflow-hidden flex items-end" aria-labelledby="about-title">
      <Blobs opacity={0.55} />
      <div data-hero-inner className="container-x relative z-10 pt-40 pb-24 will-change-transform">
        <p data-fade className="eyebrow mb-6 opacity-0">
          {t('about.hero.eyebrow')}
        </p>
        <SplitHeading as="h1" id="about-title" type="chars" immediate delay={0.3} className="display display-xl max-w-[12ch]">
          {t('about.hero.title')}
        </SplitHeading>
        <p data-fade className="lead mt-8 opacity-0 max-w-2xl">
          {t('about.hero.body')}
        </p>
      </div>
    </section>
  )
}
