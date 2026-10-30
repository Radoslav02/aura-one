import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import SceneCanvas from './SceneCanvas'
import { Headphone, StudioLights } from './HeadphoneModel'
import { useTheme } from '../context/ThemeContext'
import { useIsMobile } from '../hooks/useMedia'

/**
 * Scroll-driven exploded view. `progress` is a ref (0..1) written by the
 * section's ScrollTrigger (scrub). Phase 1 turns + zooms the model,
 * phase 2 pulls it apart.
 */
function Rig({ colors, progress, isMobile }) {
  const g = useRef()
  const explode = useRef(0)
  useFrame(() => {
    if (!g.current) return
    const p = progress.current
    // turn: 0 → 0.35 ; explode: 0.3 → 0.85
    const turn = Math.min(1, p / 0.35)
    explode.current = Math.max(0, Math.min(1, (p - 0.3) / 0.55))
    const e = explode.current
    g.current.rotation.y = -0.9 + turn * 0.9 + e * 0.35
    g.current.rotation.x = 0.1 + e * 0.15
    const s = (isMobile ? 0.8 : 1.05) - e * 0.33
    g.current.scale.setScalar(s)
    g.current.position.y = 0.1 - e * 0.15
  })
  return (
    <group ref={g}>
      <Headphone colors={colors} explode={explode} />
    </group>
  )
}

export default function ExplodedView({ progress, className = '' }) {
  const { color } = useTheme()
  const isMobile = useIsMobile()
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, isMobile ? 8 : 6.5], fov: 35 }}>
      <StudioLights />
      <Rig colors={color} progress={progress} isMobile={isMobile} />
    </SceneCanvas>
  )
}
