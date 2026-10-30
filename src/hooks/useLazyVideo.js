import { useEffect } from 'react'

/**
 * Defers loading a <video> until it is near the viewport (saves ~10 MB on
 * first load). Pass autoplay=true to start it as soon as it is attached.
 */
export function useLazyVideo(ref, src, { rootMargin = '75%', autoplay = false } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || !src) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        if (!el.src) {
          el.src = src
          el.load()
          if (autoplay) el.play().catch(() => {})
        }
        io.disconnect()
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, src, rootMargin, autoplay])
}
