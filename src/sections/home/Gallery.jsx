import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, Flip, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import { IMAGES } from '../../data/assets'
import SplitHeading from '../../components/SplitHeading'
import RevealImage from '../../components/RevealImage'
import Lightbox from '../../components/Lightbox'

/**
 * LIFESTYLE GALLERY — masonry grid; each column moves at its own scroll
 * speed; click opens a lightbox that Flips from the thumbnail.
 */
export default function Gallery() {
  const { t } = useTranslation()
  const root = useRef(null)
  const [open, setOpen] = useState(null) // { index, state }
  const alts = t('home.gallery.alts', { returnObjects: true })
  const items = IMAGES.gallery.map((g, i) => ({ ...g, alt: alts[i] || '' }))
  useSectionColor(root, SECTION.coral)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray('[data-col]', root.current).forEach((col) => {
        const speed = Number(col.dataset.speed)
        gsap.fromTo(col, { y: 80 * speed }, { y: -80 * speed, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    },
    { scope: root },
  )

  const openAt = (index, e) => {
    const img = e.currentTarget.querySelector('img')
    const state = Flip.getState(img)
    setOpen({ index, state })
  }
  const step = (d) => setOpen((o) => o && { index: (o.index + d + items.length) % items.length, state: null })

  // 3 columns on desktop, 2 on mobile; distribute round-robin
  const cols = [[], [], []]
  items.forEach((it, i) => cols[i % 3].push({ ...it, index: i }))
  const speeds = [0.6, 1.4, 0.9]

  return (
    <section ref={root} className="section relative overflow-hidden" aria-labelledby="gallery-title">
      <div className="container-x">
        <div className="max-w-3xl mb-14">
          <p className="eyebrow mb-4">{t('home.gallery.eyebrow')}</p>
          <SplitHeading as="h2" id="gallery-title" className="display display-lg">
            {t('home.gallery.title')}
          </SplitHeading>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {cols.map((col, ci) => (
            <div key={ci} data-col data-speed={speeds[ci]} className={`flex flex-col gap-4 md:gap-6 will-change-transform ${ci === 1 ? 'md:mt-24' : ''} ${ci === 2 ? 'hidden md:flex' : ''}`}>
              {col.map((it) => (
                <button key={it.id} type="button" className="text-left rounded-[var(--radius)] focus-visible:outline-offset-4" onClick={(e) => openAt(it.index, e)} data-cursor="view" aria-label={it.alt}>
                  <RevealImage id={it.id} alt={it.alt} ratio={it.ratio} distort sizes="(max-width: 768px) 50vw, 33vw" imgClassName="" data-flip-id={`gallery-${it.id}`} />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {open && <Lightbox item={items[open.index]} state={open.state} onClose={() => setOpen(null)} onPrev={() => step(-1)} onNext={() => step(1)} />}
    </section>
  )
}
