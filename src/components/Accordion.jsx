import { useRef, useState } from 'react'
import { gsap } from '../animations/gsap'

/**
 * FAQ accordion with GSAP height animation (measured, not CSS max-height).
 * items: [{ q, a }]
 */
export default function Accordion({ items = [], className = '' }) {
  const [openIdx, setOpenIdx] = useState(0)
  const panels = useRef([])

  const toggle = (i) => {
    const next = openIdx === i ? -1 : i
    panels.current.forEach((p, idx) => {
      if (!p) return
      const inner = p.firstElementChild
      if (idx === next) {
        gsap.set(p, { height: 'auto' })
        gsap.from(p, { height: 0, duration: 0.7, ease: 'auraInOut' })
        gsap.fromTo(inner, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.2 })
      } else if (idx === openIdx) {
        gsap.to(p, { height: 0, duration: 0.5, ease: 'auraInOut' })
      }
    })
    setOpenIdx(next)
  }

  return (
    <ul className={`divide-y ${className}`} style={{ borderColor: 'color-mix(in srgb, var(--fg) 15%, transparent)' }}>
      {items.map((it, i) => {
        const open = openIdx === i
        return (
          <li key={i} style={{ borderColor: 'color-mix(in srgb, var(--fg) 15%, transparent)' }}>
            <h3>
              <button
                type="button"
                className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                aria-expanded={open}
                aria-controls={`faq-panel-${i}`}
                id={`faq-btn-${i}`}
                onClick={() => toggle(i)}
              >
                <span className="display-sm display" style={{ fontWeight: 600 }}>{it.q}</span>
                <span className="relative shrink-0 w-10 h-10 rounded-full grid place-items-center transition-colors duration-500" style={{ background: open ? 'var(--c-accent)' : 'color-mix(in srgb, var(--fg) 10%, transparent)', color: open ? 'var(--dark)' : 'inherit' }} aria-hidden="true">
                  <span className="absolute w-4 h-[2px] bg-current" />
                  <span className="absolute w-4 h-[2px] bg-current transition-transform duration-500" style={{ transform: open ? 'rotate(0deg)' : 'rotate(90deg)' }} />
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-btn-${i}`}
              ref={(el) => (panels.current[i] = el)}
              className="overflow-hidden"
              style={{ height: i === 0 ? 'auto' : 0 }}
            >
              <p className="pb-7 pr-16 lead !text-base md:!text-lg">{it.a}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
