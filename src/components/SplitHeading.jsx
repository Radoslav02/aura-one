import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSplitReveal } from '../hooks/useSplitReveal'

/**
 * Heading/paragraph whose text is split and revealed line by line.
 * Re-mounts on language change (key) so SplitText re-runs on the new copy.
 *
 * <SplitHeading as="h2" className="display display-lg">…</SplitHeading>
 */
export default function SplitHeading({ as: Tag = 'h2', children, className = '', type = 'words', immediate = false, delay = 0, stagger, start, duration, ...rest }) {
  const ref = useRef(null)
  const { i18n } = useTranslation()
  useSplitReveal(ref, { type, immediate, delay, stagger, start, duration })
  return (
    <Tag key={i18n.language} ref={ref} className={`split-mask ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
