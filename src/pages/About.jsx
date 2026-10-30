import { useTranslation } from 'react-i18next'
import Page from '../components/Page'
import { SECTION } from '../data/colorways'
import AboutHero from '../sections/about/AboutHero'
import Timeline from '../sections/about/Timeline'
import Team from '../sections/about/Team'
import Values from '../sections/about/Values'
import StudioGallery from '../sections/about/StudioGallery'
import Stats from '../sections/about/Stats'
import CTA from '../sections/home/CTA'

export default function About() {
  const { t } = useTranslation()
  return (
    <Page seo="about" color={SECTION.dark}>
      <AboutHero />
      <Timeline />
      <Team />
      <Values />
      <StudioGallery />
      <Stats />
      <CTA title={t('about.cta.title')} button={t('about.cta.button')} body=" " note=" " to="/contact" />
    </Page>
  )
}
