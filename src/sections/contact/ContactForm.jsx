import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import emailjs from '@emailjs/browser'
import { gsap, useGSAP } from '../../animations/gsap'
import { useMagnetic } from '../../hooks/useMagnetic'
import { prefersReducedMotion } from '../../hooks/useMedia'

const SUBJECTS = ['general', 'support', 'partnership', 'press']
const ENV = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  key: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
}
const isConfigured = () =>
  ENV.service && ENV.template && ENV.key && !/^your_/.test(ENV.service) && !/^your_/.test(ENV.template) && !/^your_/.test(ENV.key)

let warned = false

/**
 * Contact form: React Hook Form + zod (messages re-translate on language
 * change), floating labels, animated submit (idle → sending → sent),
 * success panel. Sends through EmailJS; falls back to a simulated send when
 * the .env keys are not configured so the demo always works.
 *
 * EmailJS template variables: from_name, from_email, phone, subject, message
 */
export default function ContactForm() {
  const { t, i18n } = useTranslation()
  const root = useRef(null)
  const btnRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [sentName, setSentName] = useState('')
  useMagnetic(btnRef, { strength: 0.25 })

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t('contact.form.errors.nameRequired')).min(2, t('contact.form.errors.nameMin')),
        email: z.string().trim().min(1, t('contact.form.errors.emailRequired')).email(t('contact.form.errors.emailInvalid')),
        phone: z
          .string()
          .trim()
          .optional()
          .refine((v) => !v || /^[+\d][\d\s().-]{5,}$/.test(v), { message: t('contact.form.errors.phoneInvalid') }),
        subject: z.enum(SUBJECTS, { message: t('contact.form.errors.subjectRequired') }),
        message: z.string().trim().min(1, t('contact.form.errors.messageRequired')).min(10, t('contact.form.errors.messageMin')),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', phone: '', subject: '', message: '' }, mode: 'onTouched' })

  const subjectValue = watch('subject')

  // fields rise in on scroll
  useGSAP(
    () => {
      gsap.from('[data-field]', {
        y: prefersReducedMotion() ? 0 : 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'aura',
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      })
    },
    { scope: root },
  )

  // success panel animation
  useGSAP(
    () => {
      if (status !== 'sent') return
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({ defaults: { ease: 'aura' } })
      tl.fromTo(q('[data-success]'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(q('[data-success-ring]'), { scale: 0 }, { scale: 1, duration: 0.7, ease: 'auraBack' }, '-=0.3')
        .fromTo(q('[data-success-check]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, '-=0.35')
        .fromTo(q('[data-success-text]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.3')
    },
    { scope: root, dependencies: [status] },
  )

  const onSubmit = async (data) => {
    setStatus('sending')
    const payload = {
      from_name: data.name,
      from_email: data.email,
      phone: data.phone || '—',
      subject: t(`contact.form.subjects.${data.subject}`),
      message: data.message,
      lang: i18n.language,
    }
    try {
      if (isConfigured()) {
        await emailjs.send(ENV.service, ENV.template, payload, { publicKey: ENV.key })
      } else {
        if (!warned) {
          warned = true
          console.warn('[AURA] EmailJS is not configured — add VITE_EMAILJS_* keys to .env. Simulating a successful send.')
        }
        await new Promise((r) => setTimeout(r, 900))
      }
      setSentName(data.name)
      // button morphs into a check before the panel takes over
      gsap.to('[data-submit-label]', { opacity: 0, duration: 0.2 })
      gsap.fromTo('[data-submit-check]', { drawSVG: '0%', opacity: 1 }, { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut', onComplete: () => setStatus('sent') })
    } catch (err) {
      console.error('[AURA] EmailJS error', err)
      setStatus('error')
    }
  }

  const another = () => {
    reset()
    setStatus('idle')
    gsap.set('[data-submit-label]', { opacity: 1 })
  }

  const field = (name, extra = '') => `field ${errors[name] ? 'has-error' : ''} ${extra}`

  return (
    <div ref={root} className="relative">
      {status === 'sent' ? (
        <div data-success className="card p-8 md:p-12 min-h-[28rem] flex flex-col items-start justify-center gap-6" role="status" aria-live="polite">
          <span data-success-ring className="w-20 h-20 rounded-full grid place-items-center" style={{ background: 'var(--c-accent)', color: 'var(--dark)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path data-success-check d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h3 data-success-text className="display display-md">{t('contact.form.successTitle')}</h3>
          <p data-success-text className="lead">{t('contact.form.successBody', { name: sentName })}</p>
          <button data-success-text type="button" onClick={another} className="btn btn-outline mt-2">
            <span>{t('contact.form.another')}</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card p-7 md:p-10" aria-labelledby="contact-form-title">
          <h3 id="contact-form-title" className="display display-sm mb-8">
            {t('contact.form.title')}
          </h3>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            <div data-field className={field('name')}>
              <input id="cf-name" type="text" placeholder=" " autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-err' : undefined} {...register('name')} />
              <label htmlFor="cf-name">{t('contact.form.name')}</label>
              <span className="bar" />
              {errors.name && (
                <span id="cf-name-err" className="field-error" role="alert">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div data-field className={field('email')}>
              <input id="cf-email" type="email" placeholder=" " autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-err' : undefined} {...register('email')} />
              <label htmlFor="cf-email">{t('contact.form.email')}</label>
              <span className="bar" />
              {errors.email && (
                <span id="cf-email-err" className="field-error" role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div data-field className={field('phone')}>
              <input id="cf-phone" type="tel" placeholder=" " autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'cf-phone-err' : undefined} {...register('phone')} />
              <label htmlFor="cf-phone">{t('contact.form.phone')}</label>
              <span className="bar" />
              {errors.phone && (
                <span id="cf-phone-err" className="field-error" role="alert">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div data-field className={field('subject', subjectValue ? 'is-filled' : '')}>
              <select id="cf-subject" aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'cf-subject-err' : undefined} {...register('subject')} style={{ opacity: subjectValue ? 1 : 0 }}>
                <option value="" disabled>
                  {t('contact.form.subjects.placeholder')}
                </option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {t(`contact.form.subjects.${s}`)}
                  </option>
                ))}
              </select>
              <label htmlFor="cf-subject">{t('contact.form.subject')}</label>
              <svg className="absolute right-0 top-7 pointer-events-none opacity-60" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
              <span className="bar" />
              {errors.subject && (
                <span id="cf-subject-err" className="field-error" role="alert">
                  {errors.subject.message}
                </span>
              )}
            </div>

            <div data-field className={`${field('message')} sm:col-span-2`}>
              <textarea id="cf-message" rows={4} placeholder=" " aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-message-err' : undefined} {...register('message')} />
              <label htmlFor="cf-message">{t('contact.form.message')}</label>
              <span className="bar" />
              {errors.message && (
                <span id="cf-message-err" className="field-error" role="alert">
                  {errors.message.message}
                </span>
              )}
            </div>
          </div>

          {status === 'error' && (
            <div className="mt-6 rounded-2xl p-4 text-sm font-semibold" role="alert" style={{ background: 'color-mix(in srgb, var(--coral) 18%, transparent)', color: 'var(--coral)' }}>
              <p>{t('contact.form.errorTitle')}</p>
              <p className="font-medium opacity-80 mt-1">{t('contact.form.errorBody', { email: t('contact.info.email') })}</p>
            </div>
          )}

          <div data-field className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <button ref={btnRef} type="submit" disabled={status === 'sending'} data-cursor="send" className="btn btn-primary !px-8 !py-4 min-w-[12rem] disabled:opacity-80" aria-live="polite">
              <span data-magnetic-inner className="relative inline-flex items-center justify-center gap-3">
                <span data-submit-label className="inline-flex items-center gap-3">
                  {status === 'sending' ? (
                    <>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 3a9 9 0 1 0 9 9" />
                      </svg>
                      {t('contact.form.sending')}…
                    </>
                  ) : (
                    <>
                      {t('contact.form.submit')}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </span>
                <svg className="absolute inset-0 m-auto opacity-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path data-submit-check d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </button>
            <p className="text-xs opacity-60 max-w-xs">{t('contact.form.consent')}</p>
          </div>
        </form>
      )}
    </div>
  )
}
