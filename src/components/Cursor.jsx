import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../animations/gsap'
import { useMedia } from '../hooks/useMedia'

/**
 * Custom cursor: a dot that sticks to the pointer and a ring that trails it.
 * Interactive elements opt in with data attributes:
 *   data-cursor="view|drag|play|send|…"  → ring grows + shows translated label
 *   data-cursor-blend                    → mix-blend-mode: difference (images)
 *   data-cursor-hide                     → hide cursor (e.g. over the 3D canvas drag)
 * Colour follows --cursor, which useSectionColor tweens per section.
 */
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)
  // enable only for real pointer devices (hybrid touch laptops with a mouse still qualify)
  const finePointer = useMedia('(hover: hover) and (pointer: fine)')
  const isTouch = !finePointer
  const { t } = useTranslation()

  useGSAP(
    () => {
      if (isTouch) return
      const dx = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' })
      const dy = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' })
      const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
      const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })
      gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, opacity: 0 })

      // visible-state machine: any pointer movement shows the cursor, leaving
      // the window / tab (or switching apps) hides it. No one-shot flags, so it
      // always comes back when the user returns to the page.
      let visible = false
      const show = () => {
        if (visible) return
        visible = true
        document.documentElement.classList.add('has-cursor') // hide native cursor only while ours is on screen
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3, overwrite: 'auto' })
      }
      const hide = () => {
        if (!visible) return
        visible = false
        document.documentElement.classList.remove('has-cursor')
        gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3, overwrite: 'auto' })
      }
      const move = (e) => {
        dx(e.clientX)
        dy(e.clientY)
        rx(e.clientX)
        ry(e.clientY)
        show()
      }
      const leaveWindow = (e) => {
        // ignore synthetic leaves fired when moving over iframes/canvas edges
        if (e && e.relatedTarget) return
        hide()
      }
      const onVisibility = () => document.hidden && hide()
      let current = null
      const setState = (el) => {
        const r = ring.current
        if (!el) {
          r.classList.remove('is-label', 'is-blend')
          gsap.to(r, { scale: 1, duration: 0.4, ease: 'aura' })
          gsap.to(dot.current, { scale: 1, duration: 0.3 })
          return
        }
        const key = el.getAttribute('data-cursor')
        const blend = el.hasAttribute('data-cursor-blend')
        const hide = el.hasAttribute('data-cursor-hide')
        if (hide) {
          gsap.to([r, dot.current], { scale: 0, duration: 0.3 })
          return
        }
        if (key) {
          label.current.textContent = t(`cursor.${key}`, { defaultValue: key })
          r.classList.add('is-label')
          gsap.to(r, { scale: 2.3, duration: 0.45, ease: 'auraBack' })
          gsap.to(dot.current, { scale: 0, duration: 0.3 })
        } else if (blend) {
          r.classList.add('is-blend')
          gsap.to(r, { scale: 1.6, duration: 0.45, ease: 'aura' })
        } else {
          gsap.to(r, { scale: 1.5, duration: 0.4, ease: 'aura' })
          gsap.to(dot.current, { scale: 0.5, duration: 0.3 })
        }
      }
      const over = (e) => {
        const el = e.target.closest?.('[data-cursor],[data-cursor-blend],[data-cursor-hide],a,button,[role="button"],input,textarea,select,label')
        if (el === current) return
        current = el
        setState(el)
      }
      const down = () => gsap.to(ring.current, { scale: '-=0.3', duration: 0.15 })
      const up = () => current ? setState(current) : gsap.to(ring.current, { scale: 1, duration: 0.3 })

      window.addEventListener('mousemove', move, { passive: true })
      window.addEventListener('pointermove', move, { passive: true })
      document.addEventListener('mouseover', over, { passive: true })
      document.addEventListener('mousedown', down)
      document.addEventListener('mouseup', up)
      document.addEventListener('mouseleave', leaveWindow)
      window.addEventListener('blur', hide)
      document.addEventListener('visibilitychange', onVisibility)
      return () => {
        document.documentElement.classList.remove('has-cursor')
        window.removeEventListener('mousemove', move)
        window.removeEventListener('pointermove', move)
        document.removeEventListener('mouseover', over)
        document.removeEventListener('mousedown', down)
        document.removeEventListener('mouseup', up)
        document.removeEventListener('mouseleave', leaveWindow)
        window.removeEventListener('blur', hide)
        document.removeEventListener('visibilitychange', onVisibility)
      }
    },
    { dependencies: [isTouch, t] },
  )

  if (isTouch) return null
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} />
      </div>
    </>
  )
}
