import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Page from '../components/Page'
import { SECTION } from '../data/colorways'
import ContactHero from '../sections/contact/ContactHero'
import ContactFAQ from '../sections/contact/ContactFAQ'

// Leaflet + tiles only load once the map section approaches the viewport
const ContactMap = lazy(() => import('../sections/contact/ContactMap'))

function LazyMount({ children, placeholderHeight = '80vh' }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { rootMargin: '60%' })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <div ref={ref}>{show ? <Suspense fallback={<div style={{ minHeight: placeholderHeight }} />}>{children}</Suspense> : <div style={{ minHeight: placeholderHeight }} />}</div>
}

export default function Contact() {
  return (
    <Page seo="contact" color={SECTION.dark}>
      <ContactHero />
      <LazyMount>
        <ContactMap />
      </LazyMount>
      <ContactFAQ />
    </Page>
  )
}
