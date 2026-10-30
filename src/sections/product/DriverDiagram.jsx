import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'

/*
 * Cross-section of the 40 mm Pulse driver, drawn in a 400×400 viewBox.
 * The listener's ear is to the LEFT; the magnet sits at the back (right).
 * Each group carries data-draw (strokes) and a label with a leader line.
 */
const LABELS = [
  { key: 'mesh', x: 60, y: 60, lx: 30, ly: 24, anchor: 'start' },
  { key: 'diaphragm', x: 150, y: 120, lx: 40, ly: 380, anchor: 'start' },
  { key: 'coil', x: 232, y: 164, lx: 330, ly: 40, anchor: 'end' },
  { key: 'magnet', x: 300, y: 200, lx: 380, ly: 150, anchor: 'end' },
  { key: 'chamber', x: 330, y: 300, lx: 380, ly: 372, anchor: 'end' },
]

/**
 * DRIVER DIAGRAM — the SVG strokes draw themselves (DrawSVGPlugin) while the
 * section is pinned; callouts appear in sequence. Reduced motion → static.
 */
export default function DriverDiagram() {
  const { t } = useTranslation()
  const root = useRef(null)
  const svg = useRef(null)
  const labels = t('product.driver.labels', { returnObjects: true })
  useSectionColor(root, SECTION.navy)

  useGSAP(
    () => {
      const q = gsap.utils.selector(svg)
      const strokes = q('[data-draw]')
      const leaders = q('[data-leader]')
      const callouts = q('[data-callout]')
      const dots = q('[data-dot]')

      if (prefersReducedMotion()) return

      gsap.set(strokes, { drawSVG: '0%' })
      gsap.set(leaders, { drawSVG: '0%' })
      gsap.set(callouts, { opacity: 0, y: 6 })
      gsap.set(dots, { scale: 0, transformOrigin: 'center' })

      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=220%', pin: true, scrub: 0.6, anticipatePin: 1 },
        })
        build(tl)
      })
      mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: svg.current, start: 'top 75%', once: true } })
        build(tl)
      })

      function build(tl) {
        // strokes draw in order from outside (mesh) to inside (chamber)
        tl.to(strokes, { drawSVG: '100%', duration: 1.4, ease: 'none', stagger: 0.08 }, 0)
        // spin the voice-coil ring slowly while drawing (transform only)
        tl.fromTo(q('[data-spin]'), { rotate: -20, transformOrigin: 'center' }, { rotate: 0, duration: 1.4, ease: 'none' }, 0)
        LABELS.forEach((_, i) => {
          const at = 0.5 + i * 0.28
          tl.to(dots[i], { scale: 1, duration: 0.15, ease: 'auraBack' }, at)
          tl.to(leaders[i], { drawSVG: '100%', duration: 0.25, ease: 'none' }, at + 0.05)
          tl.to(callouts[i], { opacity: 1, y: 0, duration: 0.2, ease: 'none' }, at + 0.22)
        })
      }
      return () => mm.revert()
    },
    { scope: root },
  )

  const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' }

  return (
    <section ref={root} className="relative lg:h-[100svh] overflow-hidden section lg:py-0" aria-labelledby="driver-title">
      <div className="glow w-[60vmin] h-[60vmin] right-[-10vmin] top-[10vh]" style={{ background: 'var(--c-primary)', opacity: 0.4 }} />
      <div className="container-x h-full grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 lg:pt-20">
          <p className="eyebrow mb-4">{t('product.driver.eyebrow')}</p>
          <SplitHeading as="h2" id="driver-title" className="display display-md">
            {t('product.driver.title')}
          </SplitHeading>
          <p className="lead mt-6">{t('product.driver.body')}</p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold">
            {Object.entries(labels).map(([k, v], i) => (
              <li key={k} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full grid place-items-center text-[0.65rem] font-bold" style={{ background: 'var(--c-accent)', color: 'var(--dark)' }}>
                  {i + 1}
                </span>
                {v}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 relative">
          <svg ref={svg} viewBox="0 0 400 400" className="w-full h-auto max-h-[80svh] mx-auto text-light" role="img" aria-label={t('product.driver.title')} style={{ color: 'var(--fg)' }}>
            {/* acoustic mesh: outer cup outline + hatch */}
            <g data-draw>
              <path d="M40 80 C 10 140, 10 260, 40 320" {...S} strokeWidth={3} style={{ color: 'var(--ocean)' }} />
              <path d="M52 100 C 30 150, 30 250, 52 300" {...S} strokeDasharray="4 6" style={{ color: 'var(--ocean)' }} />
            </g>
            {/* diaphragm dome */}
            <g data-draw>
              <path d="M110 120 C 60 160, 60 240, 110 280" {...S} strokeWidth={3} style={{ color: 'var(--lime)' }} />
              <path d="M110 120 C 125 150, 125 250, 110 280" {...S} style={{ color: 'var(--lime)' }} />
            </g>
            {/* surround (rubber roll) */}
            <g data-draw>
              <path d="M110 120 c 10 -22 36 -22 46 0" {...S} style={{ color: 'var(--coral)' }} />
              <path d="M110 280 c 10 22 36 22 46 0" {...S} style={{ color: 'var(--coral)' }} />
            </g>
            {/* voice coil: former + windings */}
            <g data-draw data-spin>
              <rect x="150" y="150" width="90" height="100" rx="6" {...S} style={{ color: 'var(--sunny)' }} />
              {[160, 176, 192, 208, 224, 240].map((y) => (
                <path key={y} d={`M240 ${y} h 16`} {...S} style={{ color: 'var(--sunny)' }} />
              ))}
            </g>
            {/* magnet N52 + pole plates */}
            <g data-draw>
              <rect x="262" y="135" width="60" height="130" rx="8" {...S} strokeWidth={3} style={{ color: 'var(--violet)' }} />
              <path d="M262 175 h 60 M262 225 h 60" {...S} style={{ color: 'var(--violet)' }} />
              <path d="M280 150 l 8 -8 m-8 8 l 8 8" {...S} style={{ color: 'var(--violet)' }} />
            </g>
            {/* tuned acoustic chamber + vents */}
            <g data-draw>
              <path d="M330 110 h 30 a 20 20 0 0 1 20 20 v 140 a 20 20 0 0 1 -20 20 h -30" {...S} strokeWidth={3} style={{ color: 'var(--coral)' }} />
              <path d="M352 170 h 20 M352 200 h 20 M352 230 h 20" {...S} style={{ color: 'var(--coral)' }} />
            </g>
            {/* 40 mm dimension line */}
            <g data-draw>
              <path d="M90 350 v 14 M110 357 h 230 M340 350 v 14" {...S} style={{ color: 'var(--fg)', opacity: 0.6 }} />
            </g>
            <text x="215" y="384" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" opacity="0.7" fontFamily="var(--font-body)">
              40 mm
            </text>

            {/* callouts */}
            {LABELS.map((l, i) => (
              <g key={l.key}>
                <circle data-dot cx={l.x} cy={l.y} r="4" fill="var(--c-accent)" />
                <path data-leader d={`M${l.x} ${l.y} L${l.lx + (l.anchor === 'end' ? -10 : 10)} ${l.ly}`} {...S} style={{ color: 'var(--c-accent)' }} strokeWidth={1.5} />
                <g data-callout>
                  <circle cx={l.lx + (l.anchor === 'end' ? 2 : -2)} cy={l.ly} r="8" fill="var(--c-accent)" />
                  <text x={l.lx + (l.anchor === 'end' ? 2 : -2)} y={l.ly + 3.5} textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--dark)" fontFamily="var(--font-body)">
                    {i + 1}
                  </text>
                  <text x={l.lx + (l.anchor === 'end' ? -14 : 14)} y={l.ly + 3.5} textAnchor={l.anchor} fontSize="11" fontWeight="700" fill="currentColor" fontFamily="var(--font-body)">
                    {labels[l.key]}
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}
