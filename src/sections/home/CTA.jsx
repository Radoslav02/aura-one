import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useSectionColor } from '../../hooks/useSectionColor'
import { isTouchDevice } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'
import MagneticButton, { ArrowIcon } from '../../components/MagneticButton'

/** CTA — giant headline, magnetic pre-order button, a glow that follows the cursor */
export default function CTA({ title, body, button, note, to = '/contact' }) {
  const { t } = useTranslation()
  const root = useRef(null)
  const glow = useRef(null)
  useSectionColor(root, SECTION.violet)

  useGSAP(
    () => {
      if (isTouchDevice()) return
      const xTo = gsap.quickTo(glow.current, 'x', { duration: 1.1, ease: 'power3' })
      const yTo = gsap.quickTo(glow.current, 'y', { duration: 1.1, ease: 'power3' })
      const move = (e) => {
        const r = root.current.getBoundingClientRect()
        xTo(e.clientX - r.left)
        yTo(e.clientY - r.top)
      }
      root.current.addEventListener('mousemove', move)
      return () => root.current?.removeEventListener('mousemove', move)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative overflow-hidden min-h-[90svh] flex items-center" aria-labelledby="cta-title">
      <div ref={glow} className="absolute top-0 left-0 w-[60vmin] h-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, var(--lime) 0%, var(--coral) 35%, transparent 70%)', filter: 'blur(60px)', opacity: 0.8 }} aria-hidden="true" />
      <div className="container-x relative text-center flex flex-col items-center py-28">
        <SplitHeading as="h2" id="cta-title" type="chars" className="display display-xl max-w-[12ch]">
          {title || t('home.cta.title')}
        </SplitHeading>
        <p className="lead mt-8 text-center">{body || t('home.cta.body')}</p>
        <div className="mt-12">
          <MagneticButton to={to} variant="primary" strength={0.45} className="!px-10 !py-6 text-lg" icon={<ArrowIcon />}>
            {button || t('home.cta.button')}
          </MagneticButton>
        </div>
        <p className="mt-6 text-sm opacity-70">{note || t('home.cta.note', { price: t('common.price') })}</p>
      </div>
    </section>
  )
}
