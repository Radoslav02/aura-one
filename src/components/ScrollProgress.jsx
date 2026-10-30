import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'

/** Colourful scroll-progress bar pinned to the top edge */
export default function ScrollProgress() {
  const ref = useRef(null)
  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
    )
  })
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed top-0 left-0 h-[3px] w-full origin-left z-[9400]"
      style={{ background: 'linear-gradient(90deg, var(--violet), var(--coral), var(--sunny), var(--lime), var(--ocean))' }}
    />
  )
}
