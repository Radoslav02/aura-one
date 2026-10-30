import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gsap, ScrollTrigger } from '../animations/gsap'
import { LANG_CODES, persistLanguage } from '../i18n'

/** Strip the language prefix from a pathname */
export const stripLang = (pathname) => pathname.replace(new RegExp(`^/(${LANG_CODES.join('|')})(?=/|$)`), '') || '/'

/**
 * Current language + helpers to build localized hrefs and to switch language
 * with an animated transition (content slides out, swaps, slides back in).
 */
export function useLang() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const lang = LANG_CODES.includes(i18n.language) ? i18n.language : 'en'

  const href = useCallback((to = '/') => `/${lang}${to === '/' ? '' : to}`, [lang])

  const switchLanguage = useCallback(
    async (code) => {
      if (code === lang || !LANG_CODES.includes(code)) return
      const main = document.getElementById('main')
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (main && !reduce) {
        await gsap.to(main, { opacity: 0, y: 24, duration: 0.35, ease: 'power2.in' })
      }
      persistLanguage(code)
      document.documentElement.lang = code
      await i18n.changeLanguage(code)
      navigate(`/${code}${stripLang(location.pathname)}${location.search}`, { replace: true })

      // let React commit the new strings, then re-measure and slide back in
      requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        if (main && !reduce) gsap.to(main, { opacity: 1, y: 0, duration: 0.6, ease: 'aura', clearProps: 'transform' })
      })
    },
    [lang, i18n, navigate, location.pathname, location.search],
  )

  return { lang, href, switchLanguage }
}
