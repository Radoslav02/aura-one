import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import SceneCanvas from './SceneCanvas'
import { Headphone, StudioLights } from './HeadphoneModel'
import { useTheme } from '../context/ThemeContext'
import { useIsTouch, useReducedMotion } from '../hooks/useMedia'

function Spin({ colors, reduced }) {
  const g = useRef()
  useFrame((_, dt) => {
    if (g.current && !reduced) g.current.rotation.y += dt * 0.25
  })
  return (
    <group ref={g} position={[0, 0.15, 0]}>
      <Headphone colors={colors} />
    </group>
  )
}

/** Draggable rotation (OrbitControls: no zoom / pan). Auto-rotates when idle. */
export default function ConfiguratorScene({ className = '' }) {
  const { color } = useTheme()
  const touch = useIsTouch()
  const reduced = useReducedMotion()
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0.4, 6], fov: 35 }} shadows>
      <StudioLights />
      <Spin colors={color} reduced={reduced} />
      <ContactShadows position={[0, -1.35, 0]} opacity={0.45} scale={8} blur={2.4} far={3} color="#000" />
      {!touch && (
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.6} maxPolarAngle={Math.PI / 1.7} rotateSpeed={0.8} dampingFactor={0.08} />
      )}
    </SceneCanvas>
  )
}
