import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { LANGUAGES } from '../i18n'
import { stripLang } from '../hooks/useLang'
import { IMAGES } from '../data/assets'

/**
 * Per-page, translated meta tags. React 19 hoists <title>/<meta>/<link>
 * rendered anywhere in the tree into <head>, so no extra library is needed.
 */
export default function Seo({ page }) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const title = t(`meta.${page}.title`)
  const description = t(`meta.${page}.description`)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const path = stripLang(location.pathname)
  const url = `${origin}/${i18n.language}${path === '/' ? '' : path}`

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={t('meta.siteName')} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={IMAGES.og} />
      <meta property="og:locale" content={i18n.language === 'sr' ? 'sr_RS' : 'en_US'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={IMAGES.og} />
      <link rel="canonical" href={url} />
      {LANGUAGES.map((l) => (
        <link key={l.code} rel="alternate" hrefLang={l.code} href={`${origin}/${l.code}${path === '/' ? '' : path}`} />
      ))}
    </>
  )
}
