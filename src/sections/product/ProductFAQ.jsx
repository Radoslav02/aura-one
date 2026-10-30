import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSectionColor } from '../../hooks/useSectionColor'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'
import Accordion from '../../components/Accordion'

/** PRODUCT FAQ — GSAP-animated accordion */
export default function ProductFAQ() {
  const { t } = useTranslation()
  const root = useRef(null)
  const items = t('product.faq.items', { returnObjects: true })
  useSectionColor(root, SECTION.dark)

  return (
    <section ref={root} className="section relative" aria-labelledby="faq-title">
      <div className="container-x grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-4">{t('product.faq.eyebrow')}</p>
          <SplitHeading as="h2" id="faq-title" className="display display-lg">
            {t('product.faq.title')}
          </SplitHeading>
        </div>
        <div className="lg:col-span-8">
          <Accordion items={items} />
        </div>
      </div>
    </section>
  )
}
