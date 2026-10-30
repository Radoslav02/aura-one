import { forwardRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTransition } from '../context/TransitionContext'
import { useLang } from '../hooks/useLang'

/**
 * Localized link that plays the panel transition before changing route.
 * `to` is the path WITHOUT language prefix ("/", "/product", …).
 */
const TransitionLink = forwardRef(function TransitionLink({ to = '/', children, onClick, exact = true, ...rest }, ref) {
  const { href } = useLang()
  const { navigateTo } = useTransition()
  const location = useLocation()
  const target = href(to)
  const active = exact ? location.pathname === target : location.pathname.startsWith(target)

  const handle = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    navigateTo(target)
  }

  return (
    <a ref={ref} href={target} onClick={handle} aria-current={active ? 'page' : undefined} {...rest}>
      {children}
    </a>
  )
})

export default TransitionLink
