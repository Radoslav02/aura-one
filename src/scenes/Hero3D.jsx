import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import SceneCanvas from './SceneCanvas'
import { Headphone, StudioLights } from './HeadphoneModel'
import { useTheme } from '../context/ThemeContext'
import { useIsMobile, useReducedMotion } from '../hooks/useMedia'

/** The floating model tilts toward the pointer and slowly turns */
function Rig({ colors, reduced, isMobile }) {
  const g = useRef()
  useFrame((state, dt) => {
    if (!g.current) return
    const t = state.clock.elapsedTime
    const px = reduced ? 0 : state.pointer.x
    const py = reduced ? 0 : state.pointer.y
    const targetY = px * 0.55 + Math.sin(t * 0.35) * 0.35 - 0.2
    const targetX = -py * 0.3 + Math.sin(t * 0.5) * 0.06 + 0.1
    g.current.rotation.y += (targetY - g.current.rotation.y) * Math.min(1, dt * 3)
    g.current.rotation.x += (targetX - g.current.rotation.x) * Math.min(1, dt * 3)
  })
  return (
    <group ref={g}>
      <Float speed={reduced ? 0 : 1.6} rotationIntensity={0.25} floatIntensity={0.9}>
        <Headphone colors={colors} position={isMobile ? [0, 1.1, 0] : [0.2, 0.15, 0]} scale={isMobile ? 0.6 : 0.82} />
      </Float>
    </group>
  )
}

export default function Hero3D({ className = '' }) {
  const { color } = useTheme()
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, isMobile ? 7.5 : 6], fov: 35 }}>
      <StudioLights />
      <Rig colors={color} reduced={reduced} isMobile={isMobile} />
    </SceneCanvas>
  )
}
