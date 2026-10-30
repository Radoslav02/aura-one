import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { gsap, SplitText, useGSAP } from '../animations/gsap'
import TransitionLink from './TransitionLink'
import LanguageSwitcher from './LanguageSwitcher'
import Magnetic from './Magnetic'
import { prefersReducedMotion } from '../hooks/useMedia'

const GRADIENT = 'linear-gradient(90deg, var(--violet), var(--coral) 35%, var(--sunny) 60%, var(--lime) 80%, var(--ocean))'

const SOCIAL = [
  { name: 'Instagram', href: 'https://instagram.com', d: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM17.5 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z' },
  { name: 'TikTok', href: 'https://tiktok.com', d: 'M14 3v10.5a3.5 3.5 0 1 1-3-3.46V7a6.5 6.5 0 1 0 6 6.5V9.3a7 7 0 0 0 4 1.2V7.5A4 4 0 0 1 17 3h-3z' },
  { name: 'YouTube', href: 'https://youtube.com', d: 'M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.4 12 31 31 0 0 0 22 8.2zM10 15V9l5.2 3L10 15z' },
  { name: 'X', href: 'https://x.com', d: 'M4 3h4.5l4 5.6L17.5 3H20l-6.3 7.4L21 21h-4.5l-4.4-6.1L6.5 21H4l6.9-8L4 3z' },
]

/**
 * Footer: oversized wordmark that reveals on scroll (SplitText chars),
 * newsletter signup with zod validation, columns, language switcher, socials.
 */
export default function Footer() {
  const { t, i18n } = useTranslation()
  const root = useRef(null)
  const big = useRef(null)
  const [subscribed, setSubscribed] = useState(false)

  const schema = z.object({ email: z.string().email(t('footer.newsletter.errorInvalid')) })
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(schema) })

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const split = SplitText.create(big.current, { type: 'chars', charsClass: 'char', mask: 'chars' })
      // background-clip:text does not paint through the mask wrappers, so give
      // every char its own slice of the gradient (continuous across the word)
      const n = split.chars.length
      split.chars.forEach((c, i) => {
        c.style.background = GRADIENT
        c.style.backgroundSize = `${n * 100}% 100%`
        c.style.backgroundPosition = `${(i / Math.max(1, n - 1)) * 100}% 0`
        c.style.webkitBackgroundClip = 'text'
        c.style.backgroundClip = 'text'
        c.style.color = 'transparent'
      })
      gsap.from(split.chars, {
        yPercent: 110,
        rotate: 6,
        duration: 1.2,
        stagger: 0.06,
        ease: 'aura',
        scrollTrigger: { trigger: big.current, start: 'top 95%', once: true },
      })
      // tiny parallax on the wordmark
      gsap.fromTo(big.current, { yPercent: 20 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true } })
      return () => split.revert()
    },
    { scope: root },
  )

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600)) // PLACEHOLDER: wire to your newsletter provider
    setSubscribed(true)
    reset()
    gsap.fromTo('[data-news-success]', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'aura' })
  }

  const year = new Date().getFullYear()

  return (
    <footer ref={root} className="relative overflow-hidden bg-dark text-light" style={{ '--fg': '#FFF8F0', '--bg': '#0E0B16' }}>
      <div className="glow w-[60vw] h-[60vw] -left-[20vw] -bottom-[30vw]" style={{ background: 'var(--c-primary)', opacity: 0.35 }} />
      <div className="glow w-[40vw] h-[40vw] right-[-10vw] top-[-10vw]" style={{ background: 'var(--c-secondary)', opacity: 0.25 }} />

      <div className="container-x relative pt-24 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* newsletter */}
          <div className="lg:col-span-5">
            <h2 className="display display-sm mb-3">{t('footer.newsletter.title')}</h2>
            <p className="opacity-70 mb-6 max-w-sm">{t('footer.newsletter.body')}</p>
            {subscribed ? (
              <p data-news-success className="font-semibold text-lime flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                {t('footer.newsletter.success')}
              </p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2 max-w-md">
                <div className={`field flex items-end gap-3 ${errors.email ? 'has-error' : ''}`}>
                  <div className="relative flex-1">
                    <input id="newsletter-email" type="email" placeholder=" " autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
                    <label htmlFor="newsletter-email">{t('footer.newsletter.placeholder')}</label>
                    <span className="bar" />
                  </div>
                  <Magnetic strength={0.25}>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary !py-3 !px-5 text-sm" data-cursor="send">
                      <span data-magnetic-inner>{t('footer.newsletter.button')}</span>
                    </button>
                  </Magnetic>
                </div>
                {errors.email && <span className="field-error" role="alert">{errors.email.message}</span>}
              </form>
            )}
          </div>

          {/* columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="eyebrow mb-5">{t('footer.columns.explore')}</h3>
              <ul className="space-y-3">
                {[['home', '/'], ['product', '/product'], ['about', '/about'], ['contact', '/contact']].map(([k, to]) => (
                  <li key={k}><TransitionLink to={to} className="u-link font-medium">{t(`nav.${k}`)}</TransitionLink></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow mb-5">{t('footer.columns.company')}</h3>
              <ul className="space-y-3 opacity-90">
                <li><a href="#" className="u-link font-medium">{t('footer.links.press')}</a></li>
                <li><a href="#" className="u-link font-medium">{t('footer.links.privacy')}</a></li>
                <li><a href="#" className="u-link font-medium">{t('footer.links.terms')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="eyebrow mb-5">{t('footer.columns.follow')}</h3>
              <ul className="flex flex-wrap gap-3">
                {SOCIAL.map((s) => (
                  <li key={s.name}>
                    <Magnetic strength={0.4}>
                      <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} className="w-11 h-11 rounded-full grid place-items-center border border-light/20 hover:bg-light hover:text-dark transition-colors duration-500">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.d} /></svg>
                      </a>
                    </Magnetic>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* oversized wordmark */}
        <div className="mt-20 mb-10 overflow-hidden" aria-hidden="true">
          <div ref={big} className="display leading-[0.8] tracking-[-0.05em] select-none whitespace-nowrap" style={{ fontSize: 'clamp(4rem, 22vw, 22rem)', background: GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            AURA
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-t border-light/10 pt-6 text-sm opacity-80">
          <p>{t('footer.copyright', { year })} <span className="opacity-80">· {t('footer.madeIn')}</span></p>
          <div className="flex items-center gap-4">
            <span className="opacity-70">{t('footer.tagline')}</span>
            <LanguageSwitcher key={i18n.language} />
          </div>
        </div>
      </div>
    </footer>
  )
}
