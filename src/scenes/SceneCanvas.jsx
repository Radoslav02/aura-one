import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useTranslation } from 'react-i18next'
import { useIsMobile } from '../hooks/useMedia'

/**
 * Shared <Canvas> wrapper:
 *  - lower DPR on mobile
 *  - pauses the render loop while off-screen (IntersectionObserver)
 *  - accessible label + Suspense fallback
 */
export default function SceneCanvas({ children, className = '', camera = { position: [0, 0, 6], fov: 35 }, style, eventSource, ...rest }) {
  const wrap = useRef(null)
  const [inView, setInView] = useState(true)
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '200px' })
    if (wrap.current) io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className={className} style={style} role="img" aria-label={t('a11y.scene3d')}>
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={camera}
        frameloop={inView ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
        {...rest}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
}
