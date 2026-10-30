import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useAppReady } from '../../context/TransitionContext'
import { useSectionColor } from '../../hooks/useSectionColor'
import { SECTION } from '../../data/colorways'
import { IMAGES } from '../../data/assets'
import SplitHeading from '../../components/SplitHeading'
import RevealImage from '../../components/RevealImage'
import Blobs from '../../components/Blobs'

/**
 * PRODUCT HERO — big typographic opener with two large images that drift at
 * different parallax speeds.
 */
export default function ProductHero() {
  const { t } = useTranslation()
  const root = useRef(null)
  const ready = useAppReady()
  useSectionColor(root, SECTION.dark)

  useGSAP(
    () => {
      if (!ready) return
      gsap.fromTo('[data-fade]', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12, delay: 0.5, ease: 'aura' })
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section ref={root} className="relative overflow-hidden pt-36 md:pt-44 pb-16" aria-labelledby="product-hero-title">
      <Blobs opacity={0.45} />
      <div className="container-x relative">
        <p data-fade className="eyebrow mb-6 opacity-0">
          {t('product.hero.eyebrow')}
        </p>
        <SplitHeading as="h1" id="product-hero-title" type="chars" immediate delay={0.3} className="display display-xl max-w-[11ch]">
          {t('product.hero.title')}
        </SplitHeading>
        <div className="grid md:grid-cols-12 gap-8 mt-10 md:mt-14 items-start">
          <p data-fade className="lead md:col-span-5 opacity-0">
            {t('product.hero.body')}
          </p>
          <ul data-fade className="md:col-span-7 md:justify-self-end flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold opacity-0">
            {['badge1', 'badge2', 'badge3'].map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-accent)' }} />
                {t(`home.hero.${k}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* PLACEHOLDER IMAGES: Unsplash — swap ids in /src/data/assets.js */}
        <div className="grid grid-cols-12 gap-4 md:gap-8 mt-16 md:mt-24 items-end">
          <RevealImage id={IMAGES.product.hero} alt={t('product.hero.alt1')} ratio="4 / 5" parallax={10} className="col-span-7 md:col-span-7" sizes="(max-width: 768px) 60vw, 55vw" data-cursor-blend />
          <RevealImage id={IMAGES.product.detail} alt={t('product.hero.alt2')} ratio="1 / 1" parallax={20} direction="right" className="col-span-5 md:col-span-4 md:col-start-9 md:mb-[12vh]" sizes="(max-width: 768px) 40vw, 30vw" data-cursor-blend />
        </div>
      </div>
    </section>
  )
}
