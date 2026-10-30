import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../animations/gsap'
import { LANGUAGES } from '../i18n'
import { useLang } from '../hooks/useLang'

/**
 * EN / SR pill. The active highlight slides, and the labels scramble
 * (ScrambleTextPlugin) while the page content swaps languages.
 */
export default function LanguageSwitcher({ className = '' }) {
  const { lang, switchLanguage } = useLang()
  const { t } = useTranslation()
  const ref = useRef(null)
  const pill = useRef(null)

  useGSAP(
    () => {
      const active = ref.current.querySelector(`[data-lang="${lang}"]`)
      if (!active || !pill.current) return
      gsap.to(pill.current, { x: active.offsetLeft, width: active.offsetWidth, duration: 0.6, ease: 'aura' })
    },
    { scope: ref, dependencies: [lang] },
  )

  const onPick = (code) => {
    if (code === lang) return
    const labels = ref.current.querySelectorAll('[data-lang] span')
    labels.forEach((el) => {
      const text = el.getAttribute('data-text')
      gsap.to(el, { duration: 0.7, scrambleText: { text, chars: 'upperCase', speed: 1.2, revealDelay: 0.2 } })
    })
    switchLanguage(code)
  }

  return (
    <div ref={ref} role="group" aria-label={t('nav.language')} className={`relative inline-flex items-center rounded-full p-1 text-xs font-bold tracking-widest ${className}`} style={{ background: 'color-mix(in srgb, var(--fg) 10%, transparent)' }}>
      <span ref={pill} aria-hidden="true" className="absolute top-1 bottom-1 left-0 rounded-full" style={{ background: 'var(--fg)', width: 0 }} />
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          data-lang={l.code}
          aria-pressed={lang === l.code}
          lang={l.code}
          onClick={() => onPick(l.code)}
          className="relative z-10 px-3 py-1.5 rounded-full transition-colors duration-500"
          style={{ color: lang === l.code ? 'var(--bg)' : 'var(--fg)' }}
        >
          <span data-text={l.label}>{l.label}</span>
        </button>
      ))}
    </div>
  )
}
