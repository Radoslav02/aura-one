import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { gsap, ScrollTrigger, useGSAP } from '../animations/gsap'
import { useLenis } from '../context/LenisContext'
import { useAppReady } from '../context/TransitionContext'
import Logo from './Logo'
import Magnetic from './Magnetic'
import TransitionLink from './TransitionLink'
import LanguageSwitcher from './LanguageSwitcher'
import MagneticButton from './MagneticButton'

const NAV = [
  { key: 'home', to: '/' },
  { key: 'product', to: '/product' },
  { key: 'about', to: '/about' },
  { key: 'contact', to: '/contact' },
]

/**
 * Sticky header: hides on scroll down, shows on scroll up (ScrollTrigger
 * direction). Full-screen mobile menu with staggered links.
 */
export default function Header() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const menuRef = useRef(null)
  const menuTl = useRef(null)
  const [open, setOpen] = useState(false)
  const lenis = useLenis()
  const ready = useAppReady()
  const location = useLocation()

  // hidden until the preloader is done, then slides in
  // (y is pinned to 0 explicitly so a stale transform cache can never hide it)
  useGSAP(
    () => {
      if (!ready) {
        gsap.set(ref.current, { yPercent: -100, y: 0 })
        return
      }
      gsap.fromTo(ref.current, { yPercent: -100, y: 0 }, { yPercent: 0, y: 0, duration: 1, ease: 'aura', delay: 0.2, overwrite: 'auto' })
    },
    { dependencies: [ready] },
  )

  // hide / show on scroll direction
  useGSAP(
    () => {
      const show = gsap.quickTo(ref.current, 'yPercent', { duration: 0.5, ease: 'aura' })
      ScrollTrigger.create({
        start: 'top -120',
        end: 'max',
        onUpdate: (self) => {
          if (open) return
          show(self.direction === 1 && self.scroll() > 120 ? -110 : 0)
        },
        onLeaveBack: () => show(0),
      })
    },
    { dependencies: [open] },
  )

  // mobile menu timeline (built once, played / reversed)
  useGSAP(
    () => {
      const q = gsap.utils.selector(menuRef)
      menuTl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'aura' } })
        .set(menuRef.current, { pointerEvents: 'auto' })
        .fromTo(menuRef.current, { clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' }, { clipPath: 'circle(150% at calc(100% - 2.5rem) 2.5rem)', duration: 0.9, ease: 'auraInOut' })
        .fromTo(q('[data-menu-link]'), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.07 }, '-=0.45')
        .fromTo(q('[data-menu-foot]'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.5')
    },
    { scope: menuRef },
  )

  useEffect(() => {
    if (!menuTl.current) return
    if (open) {
      menuTl.current.timeScale(1).play()
      lenis?.stop()
    } else {
      menuTl.current.timeScale(1.6).reverse()
      if (ready) lenis?.start()
    }
  }, [open, lenis, ready])

  // close on route change / escape
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header ref={ref} className="fixed top-0 left-0 right-0" style={{ height: 'var(--header-h)', zIndex: open ? 9600 : 9000, color: open ? 'var(--dark)' : undefined }}>
        <div className="container-x h-full flex items-center justify-between gap-6">
          <Logo />
          <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
            {NAV.map((n) => (
              <Magnetic key={n.key} strength={0.25}>
                <TransitionLink to={n.to} className="u-link font-semibold text-sm tracking-wide">
                  {t(`nav.${n.key}`)}
                </TransitionLink>
              </Magnetic>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <div className="hidden md:block">
              <MagneticButton to="/contact" variant="primary" className="!py-3 !px-6">
                {t('nav.preorder')}
              </MagneticButton>
            </div>
            <button
              type="button"
              className="md:hidden relative z-[9600] w-12 h-12 rounded-full grid place-items-center"
              style={{ background: 'color-mix(in srgb, var(--fg) 10%, transparent)' }}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="block w-5 h-[2px] bg-current transition-transform duration-500" style={{ transform: open ? 'translateY(0) rotate(45deg)' : 'translateY(-4px)' }} />
              <span className="block w-5 h-[2px] bg-current absolute transition-transform duration-500" style={{ transform: open ? 'rotate(-45deg)' : 'translateY(4px)' }} />
            </button>
          </div>
        </div>
      </header>

      {/* full-screen mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className="fixed inset-0 z-[9550] pointer-events-none flex flex-col justify-between p-[var(--gutter)] pt-28 text-dark"
        style={{ background: 'var(--c-accent)', clipPath: 'circle(0% at calc(100% - 2.5rem) 2.5rem)' }}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Mobile" className="flex flex-col gap-2">
          {NAV.map((n, i) => (
            <div key={n.key} className="overflow-hidden">
              <TransitionLink data-menu-link to={n.to} className="display block will-change-transform" style={{ fontSize: 'clamp(2.5rem, 12vw, 5rem)' }} tabIndex={open ? 0 : -1}>
                <span className="text-sm align-top mr-3 opacity-50 font-body">0{i + 1}</span>
                {t(`nav.${n.key}`)}
              </TransitionLink>
            </div>
          ))}
        </nav>
        <div data-menu-foot className="flex items-center justify-between gap-4">
          <LanguageSwitcher />
          <MagneticButton to="/contact" variant="dark">
            {t('nav.preorder')}
          </MagneticButton>
        </div>
      </div>
    </>
  )
}
