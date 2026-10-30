import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import SceneCanvas from './SceneCanvas'
import { Headphone, StudioLights } from './HeadphoneModel'
import { useTheme } from '../context/ThemeContext'
import { useReducedMotion } from '../hooks/useMedia'

/** 404: the headphones bounce with squash & stretch */
function Bouncer({ colors, reduced }) {
  const g = useRef()
  useFrame((state) => {
    if (!g.current) return
    const t = state.clock.elapsedTime
    if (reduced) return
    const b = Math.abs(Math.sin(t * 2.6))
    g.current.position.y = -0.3 + b * 1.1
    const squash = b < 0.08 ? 1 - (0.08 - b) * 3 : 1
    g.current.scale.set(1 / squash, squash, 1 / squash)
    g.current.rotation.y = t * 0.6
    g.current.rotation.z = Math.sin(t * 2.6) * 0.1
  })
  return (
    <group ref={g}>
      <Headphone colors={colors} />
    </group>
  )
}

export default function Bounce3D({ className = '' }) {
  const { color } = useTheme()
  const reduced = useReducedMotion()
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0.5, 7], fov: 35 }}>
      <StudioLights />
      <Bouncer colors={color} reduced={reduced} />
      <ContactShadows position={[0, -1.7, 0]} opacity={0.5} scale={8} blur={2} far={3} />
    </SceneCanvas>
  )
}
