import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSectionColor } from '../../hooks/useSectionColor'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'
import Accordion from '../../components/Accordion'

/** Small FAQ block under the map */
export default function ContactFAQ() {
  const { t, i18n } = useTranslation()
  const root = useRef(null)
  const items = t('contact.faq.items', { returnObjects: true })
  useSectionColor(root, SECTION.light)

  return (
    <section ref={root} className="section relative" aria-labelledby="contact-faq-title">
      <div className="container-x grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-4">FAQ</p>
          <SplitHeading as="h2" id="contact-faq-title" className="display display-md">
            {t('contact.faq.title')}
          </SplitHeading>
        </div>
        <div className="lg:col-span-8">
          <Accordion key={i18n.language} items={items} />
        </div>
      </div>
    </section>
  )
}
