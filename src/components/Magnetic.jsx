import { useRef } from 'react'
import { useMagnetic } from '../hooks/useMagnetic'

/** Wraps any element and makes it magnetic (see useMagnetic) */
export default function Magnetic({ children, strength = 0.35, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null)
  useMagnetic(ref, { strength })
  return (
    <Tag ref={ref} className={`inline-block will-change-transform ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
