import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useTheme } from '../../context/ThemeContext'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { COLORWAYS, COLORWAY_KEYS, SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'
import Magnetic from '../../components/Magnetic'

const ROW_KEYS = ['finish', 'cushion', 'accent', 'edition', 'availability']

/**
 * COLORWAY TABLE — compares the 4 colorways; clicking a column picks that
 * colorway site-wide (ThemeContext) and highlights the column.
 */
export default function ColorwayTable() {
  const { t } = useTranslation()
  const { colorway, setColorway } = useTheme()
  const root = useRef(null)
  const rows = t('product.comparison.rows', { returnObjects: true })
  const values = t('product.comparison.values', { returnObjects: true })
  useSectionColor(root, SECTION.coral)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-trow]', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'aura', scrollTrigger: { trigger: '[data-table]', start: 'top 80%', once: true } })
      gsap.from('[data-thead]', { y: -20, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'aura', scrollTrigger: { trigger: '[data-table]', start: 'top 80%', once: true } })
    },
    { scope: root },
  )

  // pulse the newly selected column's cells whenever the colorway changes
  useGSAP(
    () => {
      const cells = root.current.querySelectorAll(`[data-col="${colorway}"] span.relative`)
      if (cells.length) gsap.fromTo(cells, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'aura' })
    },
    { scope: root, dependencies: [colorway] },
  )

  return (
    <section ref={root} className="section relative overflow-hidden" aria-labelledby="comparison-title">
      <div className="container-x">
        <div className="max-w-3xl mb-14">
          <p className="eyebrow mb-4">{t('product.comparison.eyebrow')}</p>
          <SplitHeading as="h2" id="comparison-title" className="display display-lg">
            {t('product.comparison.title')}
          </SplitHeading>
        </div>

        <div data-table className="overflow-x-auto no-scrollbar -mx-[var(--gutter)] px-[var(--gutter)]">
          <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[18%] pb-6 align-bottom text-xs font-bold tracking-widest uppercase opacity-60">
                  {t('home.configurator.selected')}
                </th>
                {COLORWAY_KEYS.map((key) => {
                  const active = key === colorway
                  return (
                    <th key={key} scope="col" data-thead data-col={key} className="pb-6 px-4 pt-4 align-bottom relative rounded-t-[1.5rem] transition-colors duration-500" style={{ background: active ? 'color-mix(in srgb, var(--dark) 10%, transparent)' : 'transparent' }}>
                      <Magnetic strength={0.2}>
                        <button
                          type="button"
                          onClick={() => setColorway(key)}
                          aria-pressed={active}
                          aria-label={t('a11y.colorwayButton', { name: t(`colorways.${key}.name`) })}
                          className="relative flex flex-col items-start gap-3 group"
                        >
                          <span className="w-12 h-12 rounded-full border-2 transition-transform duration-500 group-hover:scale-110" style={{ background: COLORWAYS[key].hex, borderColor: active ? 'var(--dark)' : 'rgba(255,255,255,0.6)', boxShadow: `0 10px 30px -8px ${COLORWAYS[key].hex}, inset 0 0 0 2px rgba(255,255,255,0.35)` }} />
                          <span className="display text-base md:text-lg leading-tight">{t(`colorways.${key}.name`)}</span>
                          <span className="text-xs font-semibold opacity-60">{active ? '●' : '○'} {t('home.configurator.selected')}</span>
                        </button>
                      </Magnetic>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {ROW_KEYS.map((rk) => (
                <tr key={rk} data-trow>
                  <th scope="row" className="py-5 pr-6 text-sm font-bold opacity-70 border-t" style={{ borderColor: 'color-mix(in srgb, var(--dark) 25%, transparent)' }}>
                    {rows[rk]}
                  </th>
                  {COLORWAY_KEYS.map((key) => (
                    <td key={key} data-col={key} className="relative py-5 px-4 font-semibold border-t transition-colors duration-500" style={{ borderColor: 'color-mix(in srgb, var(--dark) 25%, transparent)', background: key === colorway ? 'color-mix(in srgb, var(--dark) 10%, transparent)' : 'transparent', opacity: key === colorway ? 1 : 0.65 }}>
                      <span className="relative">{values[key][rk]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
