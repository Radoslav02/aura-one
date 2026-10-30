import TransitionLink from './TransitionLink'

/** Wordmark: the “A”s are tinted with the active accent */
export default function Logo({ className = '', size = 'text-2xl' }) {
  return (
    <TransitionLink to="/" className={`display ${size} tracking-tight inline-flex items-center gap-2 ${className}`} aria-label="AURA — home">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 48 L32 14 L50 48 M22 36 H42" stroke="var(--c-accent)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span>AURA</span>
    </TransitionLink>
  )
}
