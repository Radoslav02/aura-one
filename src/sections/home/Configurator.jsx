import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useTheme } from '../../context/ThemeContext'
import { useSectionColor } from '../../hooks/useSectionColor'
import { COLORWAYS, COLORWAY_KEYS, SECTION } from '../../data/colorways'
import ConfiguratorScene from '../../scenes/ConfiguratorScene'
import SplitHeading from '../../components/SplitHeading'
import MagneticButton, { ArrowIcon } from '../../components/MagneticButton'
import Magnetic from '../../components/Magnetic'

/**
 * COLORWAY CONFIGURATOR — swatches recolour the 3D model *and* the whole site
 * palette (ThemeContext → CSS variables). Drag the model to rotate it.
 */
export default function Configurator() {
  const { t } = useTranslation()
  const { colorway, setColorway } = useTheme()
  const root = useRef(null)
  const nameRef = useRef(null)
  useSectionColor(root, SECTION.dark)

  // name & mood swap with a quick slide whenever the colorway changes
  useGSAP(
    () => {
      gsap.fromTo(nameRef.current.children, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'aura' })
      gsap.fromTo('[data-swatch-ring]', { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'auraBack' })
    },
    { scope: root, dependencies: [colorway] },
  )

  useGSAP(
    () => {
      gsap.from('[data-config-canvas]', { opacity: 0, scale: 0.9, duration: 1.2, scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section relative overflow-hidden" aria-labelledby="config-title">
      <div className="container-x grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-4 order-2 lg:order-1">
          <p className="eyebrow mb-4">{t('home.configurator.eyebrow')}</p>
          <SplitHeading as="h2" id="config-title" className="display display-lg">
            {t('home.configurator.title')}
          </SplitHeading>

          <div ref={nameRef} className="mt-10 overflow-hidden">
            <p className="text-xs font-bold tracking-widest uppercase opacity-60">{t('home.configurator.selected')}</p>
            <p className="display display-sm mt-2" style={{ color: 'var(--c-primary)' }}>{t(`colorways.${colorway}.name`)}</p>
            <p className="opacity-75 mt-1">{t(`colorways.${colorway}.mood`)}</p>
          </div>

          <div className="mt-8 flex gap-4" role="radiogroup" aria-label={t('home.configurator.selected')}>
            {COLORWAY_KEYS.map((key) => {
              const c = COLORWAYS[key]
              const active = key === colorway
              return (
                <div key={key}>
                  <Magnetic strength={0.4}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={t('a11y.colorwayButton', { name: t(`colorways.${key}.name`) })}
                      onClick={() => setColorway(key)}
                      className="relative w-12 h-12 rounded-full grid place-items-center"
                    >
                      <span className="w-9 h-9 rounded-full transition-transform duration-500" style={{ background: c.hex, transform: active ? 'scale(1)' : 'scale(0.8)', boxShadow: `0 0 24px ${active ? c.hex : 'transparent'}, inset 0 0 0 2px rgba(255,255,255,0.5)` }} />
                      {active && <span data-swatch-ring className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--fg)' }} />}
                    </button>
                  </Magnetic>
                </div>
              )
            })}
          </div>

          <div className="mt-10">
            <MagneticButton to="/contact" variant="primary" icon={<ArrowIcon />}>
              {t('home.configurator.cta', { color: t(`colorways.${colorway}.short`) })}
            </MagneticButton>
          </div>
        </div>

        <div className="lg:col-span-8 order-1 lg:order-2 relative">
          {/* glow sits behind the model, centred on the 3D frame */}
          <div className="glow w-[70vmin] h-[70vmin] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: 'var(--c-primary)', opacity: 0.5 }} aria-hidden="true" />
        <div data-config-canvas className="relative h-[55vh] lg:h-[80vh] rounded-[var(--radius)] overflow-hidden" data-cursor="drag" style={{ background: 'color-mix(in srgb, var(--fg) 4%, transparent)' }}>
          <ConfiguratorScene className="absolute inset-0" />
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest uppercase opacity-60 pointer-events-none flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 12H3m0 0 3-3m-3 3 3 3M16 12h5m0 0-3-3m3 3-3 3" /></svg>
            {t('home.configurator.hint')}
          </p>
        </div>
        </div>
      </div>
    </section>
  )
}
