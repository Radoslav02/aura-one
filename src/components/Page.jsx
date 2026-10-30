import { useEffect, useLayoutEffect, useRef } from 'react'
import { ScrollTrigger } from '../animations/gsap'
import { useTransition } from '../context/TransitionContext'
import { setSectionColor } from '../hooks/useSectionColor'
import { SECTION } from '../data/colorways'
import Seo from './Seo'

/**
 * Wrapper for every route. Sets the page's starting colours, reveals the
 * transition panels once mounted, and refreshes ScrollTrigger after layout
 * settles / images load.
 */
export default function Page({ children, seo, color = SECTION.dark, className = '' }) {
  const ref = useRef(null)
  const { reveal } = useTransition()

  useLayoutEffect(() => {
    setSectionColor(color, true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reveal()
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 200)
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 1200)
    // refresh once lazy images in this page have loaded
    const imgs = Array.from(ref.current?.querySelectorAll('img') || []).filter((i) => !i.complete)
    let left = imgs.length
    const onLoad = () => {
      if (--left <= 0) ScrollTrigger.refresh()
    }
    imgs.forEach((i) => i.addEventListener('load', onLoad, { once: true }))
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      imgs.forEach((i) => i.removeEventListener('load', onLoad))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main id="main" ref={ref} className={`relative ${className}`}>
      {seo && <Seo page={seo} />}
      {children}
    </main>
  )
}
