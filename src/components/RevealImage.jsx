import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { prefersReducedMotion } from '../hooks/useMedia'
import { srcset, unsplash } from '../data/assets'

/**
 * Image that reveals with a clip-path wipe + scale-down on scroll.
 * `distort` adds a hover skew/scale "liquid" effect (transform only).
 * Accepts an Unsplash `id` (responsive srcset) or a plain `src`.
 */
export default function RevealImage({
  id,
  src,
  alt = '',
  ratio = '4 / 5',
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
  imgClassName = '',
  distort = false,
  parallax = 0,
  direction = 'up',
  style,
  loading = 'lazy',
  ...rest
}) {
  const wrap = useRef(null)
  const img = useRef(null)

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      const clipFrom = { up: 'inset(100% 0 0 0)', down: 'inset(0 0 100% 0)', left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)' }[direction]
      if (reduce) {
        gsap.from(wrap.current, { opacity: 0, duration: 0.8, scrollTrigger: { trigger: wrap.current, start: 'top 88%', once: true } })
      } else {
        gsap.fromTo(
          wrap.current,
          { clipPath: clipFrom },
          { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'auraInOut', scrollTrigger: { trigger: wrap.current, start: 'top 85%', once: true } },
        )
        gsap.fromTo(img.current, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'aura', scrollTrigger: { trigger: wrap.current, start: 'top 85%', once: true } })
      }
      if (parallax && !reduce) {
        gsap.fromTo(
          img.current,
          { yPercent: -parallax },
          { yPercent: parallax, ease: 'none', scrollTrigger: { trigger: wrap.current, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      }
      if (distort && !reduce) {
        const el = img.current
        const sx = gsap.quickTo(el, 'skewX', { duration: 0.6, ease: 'power3' })
        const sy = gsap.quickTo(el, 'skewY', { duration: 0.6, ease: 'power3' })
        const move = (e) => {
          const r = wrap.current.getBoundingClientRect()
          const x = (e.clientX - r.left) / r.width - 0.5
          const y = (e.clientY - r.top) / r.height - 0.5
          sx(x * -8)
          sy(y * 8)
        }
        const enter = () => gsap.to(el, { scale: 1.1, duration: 0.8, ease: 'aura' })
        const leave = () => {
          sx(0)
          sy(0)
          gsap.to(el, { scale: 1, duration: 0.8, ease: 'aura' })
        }
        wrap.current.addEventListener('mousemove', move)
        wrap.current.addEventListener('mouseenter', enter)
        wrap.current.addEventListener('mouseleave', leave)
        return () => {
          wrap.current?.removeEventListener('mousemove', move)
          wrap.current?.removeEventListener('mouseenter', enter)
          wrap.current?.removeEventListener('mouseleave', leave)
        }
      }
    },
    { scope: wrap },
  )

  const source = src || unsplash(id, 1200)
  return (
    <div ref={wrap} className={`mask-img relative ${className}`} style={{ aspectRatio: ratio, ...style }} {...rest}>
      <img
        ref={img}
        src={source}
        srcSet={id ? srcset(id) : undefined}
        sizes={id ? sizes : undefined}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover will-change-transform ${imgClassName}`}
        style={parallax ? { height: `${100 + parallax * 2}%`, top: `-${parallax}%` } : undefined}
      />
    </div>
  )
}
