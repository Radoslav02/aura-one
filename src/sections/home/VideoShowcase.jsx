import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion, isTouchDevice } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import { VIDEOS } from '../../data/assets'
import SplitHeading from '../../components/SplitHeading'
import { useLazyVideo } from '../../hooks/useLazyVideo'

/**
 * VIDEO SHOWCASE — rounded frame grows to full-bleed as you scroll
 * (clip-path inset scrub); a play button follows the cursor inside it.
 */
export default function VideoShowcase() {
  const { t } = useTranslation()
  const root = useRef(null)
  const frame = useRef(null)
  const video = useRef(null)
  const playBtn = useRef(null)
  const [playing, setPlaying] = useState(false)
  useSectionColor(root, SECTION.dark)
  useLazyVideo(video, VIDEOS.film.src)

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      if (!reduce) {
        gsap.fromTo(
          frame.current,
          { clipPath: 'inset(12% 18% 12% 18% round 2.5rem)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0rem)', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top 10%', scrub: 0.6 } },
        )
      }
      // cursor-following play button
      if (isTouchDevice()) {
        gsap.set(playBtn.current, { xPercent: -50, yPercent: -50, left: '50%', top: '50%' })
        return
      }
      const xTo = gsap.quickTo(playBtn.current, 'x', { duration: 0.6, ease: 'power3' })
      const yTo = gsap.quickTo(playBtn.current, 'y', { duration: 0.6, ease: 'power3' })
      const el = frame.current
      const move = (e) => {
        const r = el.getBoundingClientRect()
        xTo(e.clientX - r.left)
        yTo(e.clientY - r.top)
      }
      const enter = () => gsap.to(playBtn.current, { scale: 1, opacity: 1, duration: 0.4 })
      const leave = () => gsap.to(playBtn.current, { scale: 0.5, opacity: 0, duration: 0.4 })
      gsap.set(playBtn.current, { xPercent: -50, yPercent: -50, scale: 0.5, opacity: 0 })
      el.addEventListener('mousemove', move)
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
      return () => {
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
      }
    },
    { scope: root },
  )

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      v.muted = false
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <section ref={root} id="film" className="relative py-[12vh]" aria-labelledby="film-title">
      <div className="container-x mb-10 grid md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-7">
          <p className="eyebrow mb-4">{t('home.video.eyebrow')}</p>
          <SplitHeading as="h2" id="film-title" className="display display-lg">
            {t('home.video.title')}
          </SplitHeading>
        </div>
        <p className="md:col-span-5 lead">{t('home.video.body')}</p>
      </div>

      <div ref={frame} className="relative h-[80svh] overflow-hidden will-change-[clip-path] bg-dark" data-cursor-hide onClick={toggle} role="button" tabIndex={0} aria-label={playing ? t('home.video.pause') : t('home.video.play')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}>
        {/* PLACEHOLDER VIDEO: Pexels ocean aerial — replace in /src/data/assets.js */}
        <video ref={video} className="absolute inset-0 w-full h-full object-cover" poster={VIDEOS.film.poster} muted loop playsInline preload="none" aria-label={t('a11y.videoFilm')} />
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-700" style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(14,11,22,0.6))', opacity: playing ? 0 : 1 }} />
        <div ref={playBtn} className="absolute top-0 left-0 w-28 h-28 rounded-full grid place-items-center text-dark font-bold text-xs tracking-widest uppercase pointer-events-none will-change-transform" style={{ background: 'var(--c-accent)' }} aria-hidden="true">
          {playing ? t('cursor.pause') : t('cursor.play')}
        </div>
      </div>
    </section>
  )
}
