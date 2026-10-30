import { useEffect, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, Flip } from '../animations/gsap'
import { useLenis } from '../context/LenisContext'
import { unsplash } from '../data/assets'

/**
 * Fullscreen lightbox. The thumbnail's Flip state is captured by the caller
 * (Flip.getState) and passed in; the lightbox image shares the same
 * data-flip-id, so Flip.from() animates it from the grid to the centre.
 */
export default function Lightbox({ item, state, onClose, onPrev, onNext }) {
  const { t } = useTranslation()
  const overlay = useRef(null)
  const img = useRef(null)
  const lenis = useLenis()

  useLayoutEffect(() => {
    if (!item) return
    lenis?.stop()
    gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    if (state) {
      Flip.from(state, { targets: img.current, duration: 0.9, ease: 'auraInOut', absolute: true, scale: true })
    } else {
      gsap.fromTo(img.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })
    }
    gsap.fromTo('[data-lb-ui]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.4 })
    return () => lenis?.start()
  }, [item?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    gsap.to(overlay.current, { opacity: 0, duration: 0.4, onComplete: onClose })
    gsap.to(img.current, { scale: 0.92, duration: 0.4, ease: 'power2.in' })
  }

  if (!item) return null
  return (
    <div ref={overlay} role="dialog" aria-modal="true" aria-label={item.alt} className="fixed inset-0 z-[9300] grid place-items-center p-6 md:p-12" style={{ background: 'rgba(14,11,22,0.92)', backdropFilter: 'blur(12px)' }} onClick={close} data-cursor="close">
      <img
        ref={img}
        data-flip-id={`gallery-${item.id}`}
        src={unsplash(item.id, 1800)}
        alt={item.alt}
        className="max-h-[80vh] max-w-full w-auto object-contain rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-cursor-blend
      />
      <button data-lb-ui type="button" onClick={close} aria-label={t('a11y.closeLightbox')} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-light text-dark grid place-items-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
      <div data-lb-ui className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onPrev} aria-label={t('a11y.prev')} className="w-12 h-12 rounded-full border border-light/30 text-light grid place-items-center hover:bg-light hover:text-dark transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 5l-7 7 7 7" /></svg>
        </button>
        <p className="text-light/80 text-sm max-w-xs text-center hidden sm:block">{item.alt}</p>
        <button type="button" onClick={onNext} aria-label={t('a11y.next')} className="w-12 h-12 rounded-full border border-light/30 text-light grid place-items-center hover:bg-light hover:text-dark transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}
