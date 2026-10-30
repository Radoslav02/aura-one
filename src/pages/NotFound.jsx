import { useTranslation } from 'react-i18next'
import Page from '../components/Page'
import { SECTION } from '../data/colorways'
import SplitHeading from '../components/SplitHeading'
import MagneticButton from '../components/MagneticButton'
import Bounce3D from '../scenes/Bounce3D'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <Page seo="notFound" color={SECTION.dark}>
      <section className="relative min-h-[100svh] overflow-hidden flex items-end">
        <div className="absolute inset-0 md:left-[35%]"><Bounce3D className="w-full h-full" /></div>
        <div className="container-x relative pb-24 pt-40">
          <p className="eyebrow mb-4">{t('notFound.eyebrow')}</p>
          <SplitHeading as="h1" className="display display-xl" immediate>{t('notFound.title')}</SplitHeading>
          <p className="lead mt-6">{t('notFound.body')}</p>
          <div className="mt-10"><MagneticButton to="/" variant="primary">{t('notFound.button')}</MagneticButton></div>
        </div>
      </section>
    </Page>
  )
}
