import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../../animations/gsap'
import { useAppReady } from '../../context/TransitionContext'
import { useSectionColor } from '../../hooks/useSectionColor'
import { prefersReducedMotion } from '../../hooks/useMedia'
import { SECTION } from '../../data/colorways'
import SplitHeading from '../../components/SplitHeading'
import Magnetic from '../../components/Magnetic'
import ContactForm from './ContactForm'

const SOCIAL = [
  { name: 'Instagram', href: 'https://instagram.com', d: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM17.5 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z' },
  { name: 'TikTok', href: 'https://tiktok.com', d: 'M14 3v10.5a3.5 3.5 0 1 1-3-3.46V7a6.5 6.5 0 1 0 6 6.5V9.3a7 7 0 0 0 4 1.2V7.5A4 4 0 0 1 17 3h-3z' },
  { name: 'YouTube', href: 'https://youtube.com', d: 'M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.4 12 31 31 0 0 0 22 8.2zM10 15V9l5.2 3L10 15z' },
  { name: 'X', href: 'https://x.com', d: 'M4 3h4.5l4 5.6L17.5 3H20l-6.3 7.4L21 21h-4.5l-4.4-6.1L6.5 21H4l6.9-8L4 3z' },
]

/** CONTACT HERO — split layout: animated heading + info on the left, form on the right */
export default function ContactHero() {
  const { t } = useTranslation()
  const root = useRef(null)
  const ready = useAppReady()
  useSectionColor(root, SECTION.dark)

  const email = t('contact.info.email')
  const phone = t('contact.info.phone')
  const INFO = [
    { label: t('contact.info.emailLabel'), value: email, href: `mailto:${email}` },
    { label: t('contact.info.phoneLabel'), value: phone, href: `tel:${phone.replace(/\s+/g, '')}` },
    { label: t('contact.info.addressLabel'), value: t('contact.info.address') },
    { label: t('contact.info.hoursLabel'), value: t('contact.info.hours') },
  ]

  useGSAP(
    () => {
      if (!ready) return
      const q = gsap.utils.selector(root)
      const reduce = prefersReducedMotion()
      const tl = gsap.timeline({ defaults: { ease: 'aura' } })
      tl.fromTo(q('[data-fade]'), { y: reduce ? 0 : 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1 }, 0.5)
        .fromTo(q('[data-info]'), { y: reduce ? 0 : 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.9)
        .fromTo(q('[data-social]'), { scale: reduce ? 1 : 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.07, ease: 'auraBack' }, 1.3)
        .fromTo(q('[data-form]'), { y: reduce ? 0 : 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 }, 0.7)
      if (!reduce) {
        gsap.to(q('[data-glow]'), { x: 80, y: -60, scale: 1.2, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      }
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section ref={root} className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32" aria-labelledby="contact-title">
      <div data-glow className="glow w-[60vmin] h-[60vmin] -left-[15vmin] top-[10vh]" style={{ background: 'var(--c-primary)', opacity: 0.45 }} />
      <div className="glow w-[40vmin] h-[40vmin] right-[-10vmin] bottom-[-10vmin]" style={{ background: 'var(--c-secondary)', opacity: 0.3 }} />

      <div className="container-x relative grid lg:grid-cols-12 gap-14 lg:gap-10 items-start">
        <div className="lg:col-span-6">
          <p data-fade className="eyebrow mb-6 opacity-0">
            {t('contact.hero.eyebrow')}
          </p>
          <SplitHeading as="h1" id="contact-title" type="chars" immediate delay={0.3} className="display display-lg">
            {t('contact.hero.title')}
          </SplitHeading>
          <p data-fade className="lead mt-8 opacity-0">
            {t('contact.hero.body')}
          </p>

          <dl className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-7">
            {INFO.map((item) => (
              <div key={item.label} data-info className="opacity-0">
                <dt className="text-xs font-bold tracking-widest uppercase opacity-60 mb-2">{item.label}</dt>
                <dd className="font-semibold text-lg leading-snug">
                  {item.href ? (
                    <a href={item.href} className="u-link" style={{ color: 'var(--c-accent)' }}>
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-12">
            <p data-info className="text-xs font-bold tracking-widest uppercase opacity-60 mb-4">
              {t('contact.info.social')}
            </p>
            <ul className="flex flex-wrap gap-3">
              {SOCIAL.map((s) => (
                <li key={s.name} data-social className="opacity-0">
                  <Magnetic strength={0.4}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.name}
                      className="group w-12 h-12 rounded-full grid place-items-center border transition-colors duration-500 hover:text-dark"
                      style={{ borderColor: 'color-mix(in srgb, var(--fg) 25%, transparent)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d={s.d} />
                      </svg>
                    </a>
                  </Magnetic>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-form className="lg:col-span-6 opacity-0">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
