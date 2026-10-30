import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSectionColor } from '../../hooks/useSectionColor'
import { SECTION } from '../../data/colorways'
import { IMAGES, unsplash } from '../../data/assets'
import SplitHeading from '../../components/SplitHeading'
import Marquee from '../../components/Marquee'

function Card({ item, avatar }) {
  return (
    <figure className="w-[22rem] md:w-[26rem] shrink-0 rounded-[var(--radius)] p-7 bg-dark text-light flex flex-col justify-between gap-6" style={{ minHeight: '15rem' }}>
      <blockquote className="text-lg leading-snug font-medium">“{item.text}”</blockquote>
      <figcaption className="flex items-center gap-3">
        <img src={unsplash(avatar, 96)} alt="" width="44" height="44" loading="lazy" className="w-11 h-11 rounded-full object-cover" />
        <div>
          <p className="font-bold text-sm">{item.name}</p>
          <p className="text-xs opacity-60">{item.role}</p>
        </div>
        <span className="ml-auto text-sunny tracking-tighter" aria-label="5 out of 5">★★★★★</span>
      </figcaption>
    </figure>
  )
}

/** TESTIMONIALS — two infinite marquees whose speed/direction follow scroll */
export default function Testimonials() {
  const { t } = useTranslation()
  const root = useRef(null)
  const items = t('home.testimonials.items', { returnObjects: true })
  useSectionColor(root, SECTION.sunny)

  return (
    <section ref={root} className="section overflow-hidden" aria-labelledby="testimonials-title">
      <div className="container-x mb-12">
        <p className="eyebrow mb-4">{t('home.testimonials.eyebrow')}</p>
        <SplitHeading as="h2" id="testimonials-title" className="display display-lg max-w-[14ch]">
          {t('home.testimonials.title')}
        </SplitHeading>
      </div>
      <div className="flex flex-col gap-6 -rotate-2 scale-[1.03] origin-center">
        <Marquee speed={38}>
          {items.slice(0, 3).map((it, i) => <Card key={i} item={it} avatar={IMAGES.avatars[i]} />)}
        </Marquee>
        <Marquee speed={44} reverse>
          {items.slice(3).map((it, i) => <Card key={i} item={it} avatar={IMAGES.avatars[i + 3]} />)}
        </Marquee>
      </div>
    </section>
  )
}
