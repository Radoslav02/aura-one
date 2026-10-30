import { useRef } from 'react'
import { useMagnetic } from '../hooks/useMagnetic'
import TransitionLink from './TransitionLink'

/**
 * Pill button with magnetic pull + sliding fill hover.
 * Pass `to` for an internal route (transition link), `href` for external,
 * otherwise renders a <button>.
 */
export default function MagneticButton({
  children,
  to,
  href,
  variant = 'primary',
  className = '',
  strength = 0.3,
  icon,
  ...rest
}) {
  const ref = useRef(null)
  useMagnetic(ref, { strength })
  const cls = `btn btn-${variant} ${className}`
  const content = (
    <>
      <span data-magnetic-inner className="inline-flex items-center gap-3">
        {children}
        {icon}
      </span>
    </>
  )
  if (to) {
    return (
      <TransitionLink ref={ref} to={to} className={cls} {...rest}>
        {content}
      </TransitionLink>
    )
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={cls} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button ref={ref} type="button" className={cls} {...rest}>
      {content}
    </button>
  )
}

export const ArrowIcon = ({ className = '' }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
