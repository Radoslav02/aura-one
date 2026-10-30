import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { persistLanguage } from '../i18n'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Cursor from '../components/Cursor'
import Preloader from '../components/Preloader'
import ScrollProgress from '../components/ScrollProgress'
import Grain from '../components/Grain'

/** Syncs the URL language with i18next + <html lang>, renders the site chrome */
export default function LangLayout() {
  const { lang } = useParams()
  const { i18n, t } = useTranslation()

  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang)
    document.documentElement.lang = lang
    persistLanguage(lang)
  }, [lang, i18n])

  return (
    <>
      <a href="#main" className="skip-link">
        {t('nav.skip')}
      </a>
      <Preloader />
      <ScrollProgress />
      <Header />
      <Outlet />
      <Footer />
      <Cursor />
      <Grain />
    </>
  )
}
