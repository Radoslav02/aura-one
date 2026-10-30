import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { MODEL } from '../data/assets'

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  AURA ONE — PROCEDURAL HEADPHONE MODEL
 *  Built entirely from Three.js geometry so the site runs with zero model
 *  downloads. Every real component is modelled as its own named part so the
 *  exploded view can pull it apart:
 *
 *  headband  extruded aluminium shell + leather underside + stitching
 *  slider    brushed-steel adjustment arms with notches + housings
 *  yoke      forks with pivot pins + top hinge
 *  cup       lathe-profiled anodised shell, touch ring, buttons, USB-C, mics, LED
 *  cap       outer logo disc
 *  grille    perforated acoustic mesh (canvas alpha texture)
 *  driver    magnet, copper voice coil, dome diaphragm, surround, basket
 *  cushion   memory-foam leather ear pad with grain + stitching + fabric
 *  chip      Pulse A1 PCB with components (right cup)
 *  battery   Li-Po pack (left cup)
 *
 *  Swap for a real GLB: set MODEL.USE_GLB in /src/data/assets.js and export
 *  nodes named Headband, SliderL/R, YokeL/R, CupL/R, CapL/R, GrilleL/R,
 *  DriverL/R, CushionL/R, Chip, Battery.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * props
 *  colors   { material, cushion, detail }  — lerped every frame (smooth recolour)
 *  explode  ref { current: 0..1 }          — exploded-view progress (optional)
 */

const R = 1.22 // headband radius / cup x position
const CUP_Y = -0.76 // cup centre height
const CUP_R = 0.48 // cup outer radius

/* Exploded offsets per part (x mirrored for the left side) */
const EXPLODE = {
  headband: new THREE.Vector3(0, 0.95, 0),
  slider: new THREE.Vector3(0, 0.95, 0),
  yoke: new THREE.Vector3(0, 0.55, 0),
  cushion: new THREE.Vector3(-0.85, 0, 0),
  grille: new THREE.Vector3(-0.5, 0, 0),
  driver: new THREE.Vector3(-0.18, 0, 0),
  chip: new THREE.Vector3(0.18, 0, 0),
  battery: new THREE.Vector3(0.18, 0, 0),
  cup: new THREE.Vector3(0.6, 0, 0),
  cap: new THREE.Vector3(1.05, 0, 0),
}

/* ---------- geometry helpers ---------- */

class ArcCurve extends THREE.Curve {
  constructor(radius, from = 0, to = Math.PI) {
    super()
    this.radius = radius
    this.from = from
    this.to = to
  }
  getPoint(t, target = new THREE.Vector3()) {
    const a = this.from + (this.to - this.from) * t
    return target.set(Math.cos(a) * this.radius, Math.sin(a) * this.radius, 0)
  }
}

function roundedRect(w, h, r) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** Headband shell: rounded-rect cross-section extruded along an arc */
function useBandGeometry(radius, w, h, from, to, steps = 80) {
  return useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, Math.min(w, h) * 0.45), {
      steps,
      bevelEnabled: false,
      extrudePath: new ArcCurve(radius, from, to),
    })
    geo.computeVertexNormals()
    return geo
  }, [radius, w, h, from, to, steps])
}

/** Ear-cup shell: lathe profile (radius, depth). y=0 outer face, +y → head */
function useCupGeometry() {
  return useMemo(() => {
    const pts = [
      [0.0, 0.0],
      [0.18, 0.005],
      [0.3, 0.02],
      [0.39, 0.05],
      [0.445, 0.1],
      [0.47, 0.16],
      [CUP_R, 0.24],
      [CUP_R, 0.3],
      [0.47, 0.34],
      [0.44, 0.36],
      [0.4, 0.365], // inner lip
      [0.4, 0.33],
      [0.43, 0.3],
      [0.43, 0.1],
      [0.3, 0.06],
      [0.0, 0.05],
    ].map(([r, y]) => new THREE.Vector2(r, y))
    const geo = new THREE.LatheGeometry(pts, 96)
    geo.computeVertexNormals()
    return geo
  }, [])
}

/** Canvas textures: perforated grille alpha + leather grain bump (built once) */
function useTextures() {
  return useMemo(() => {
    // grille: hex grid of holes
    const g = document.createElement('canvas')
    g.width = g.height = 512
    const gc = g.getContext('2d')
    gc.fillStyle = '#fff' // opaque metal
    gc.fillRect(0, 0, 512, 512)
    gc.fillStyle = '#000' // holes
    const step = 22
    for (let y = 0, row = 0; y < 512 + step; y += step * 0.87, row++) {
      for (let x = (row % 2) * step * 0.5; x < 512 + step; x += step) {
        gc.beginPath()
        gc.arc(x, y, 6.5, 0, Math.PI * 2)
        gc.fill()
      }
    }
    const grille = new THREE.CanvasTexture(g)
    grille.wrapS = grille.wrapT = THREE.RepeatWrapping
    grille.repeat.set(2, 2)

    // leather grain: noise
    const l = document.createElement('canvas')
    l.width = l.height = 256
    const lc = l.getContext('2d')
    const img = lc.createImageData(256, 256)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 90
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    lc.putImageData(img, 0, 0)
    const leather = new THREE.CanvasTexture(l)
    leather.wrapS = leather.wrapT = THREE.RepeatWrapping
    leather.repeat.set(6, 6)

    // brushed metal: horizontal streaks
    const b = document.createElement('canvas')
    b.width = 256
    b.height = 256
    const bc = b.getContext('2d')
    bc.fillStyle = '#808080'
    bc.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 1800; i++) {
      bc.strokeStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${Math.random() * 0.12})`
      const y = Math.random() * 256
      bc.beginPath()
      bc.moveTo(0, y)
      bc.lineTo(256, y + (Math.random() - 0.5) * 2)
      bc.stroke()
    }
    const brushed = new THREE.CanvasTexture(b)
    brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping
    brushed.repeat.set(3, 1)

    return { grille, leather, brushed }
  }, [])
}

/* ---------- materials (shared presets) ---------- */
const DARK = '#15121d'
const STEEL = '#d2d3d8'
const COPPER = '#c0703a'
const PCB = '#0d4a3a'

/* ---------- one ear-cup assembly ---------- */
function EarCup({ s, colors, setPart, mats, tex, cupGeo }) {
  const sx = s === 'L' ? -1 : 1
  const cx = R * sx
  const rotZ = (sx * Math.PI) / 2 // lathe axis → ±X, outer face outward
  const faceX = cx + 0.165 * sx // outer face plane

  return (
    <group>
      {/* ── slider arm + housing ── */}
      <group ref={setPart('slider', s)}>
        <mesh position={[cx, -0.02, 0]} castShadow>
          <boxGeometry args={[0.13, 0.24, 0.36]} />
          <meshStandardMaterial ref={mats.shell} color={colors.material} metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[cx, -0.2, 0]} castShadow>
          <boxGeometry args={[0.045, 0.42, 0.17]} />
          <meshStandardMaterial color={STEEL} metalness={1} roughness={0.32} roughnessMap={tex.brushed} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[cx + 0.024 * sx, -0.12 - i * 0.055, 0]}>
            <boxGeometry args={[0.004, 0.012, 0.1]} />
            <meshStandardMaterial color="#6a6b72" metalness={1} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ── yoke / fork ── */}
      <group ref={setPart('yoke', s)} position={[cx, CUP_Y, 0]}>
        <mesh position={[0, 0.54, 0]} castShadow>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial ref={mats.shell2} color={colors.material} metalness={0.5} roughness={0.35} />
        </mesh>
        <group rotation-y={Math.PI / 2}>
          <mesh rotation-z={-0.4} castShadow>
            <torusGeometry args={[0.55, 0.032, 16, 80, Math.PI + 0.8]} />
            <meshStandardMaterial ref={mats.shell3} color={colors.material} metalness={0.55} roughness={0.32} />
          </mesh>
        </group>
        {/* pivot pins */}
        {[-1, 1].map((zs) => (
          <mesh key={zs} position={[-0.02 * sx, -0.214, zs * 0.5]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 20]} />
            <meshStandardMaterial color={STEEL} metalness={1} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ── cup shell ── */}
      <group ref={setPart('cup', s)} position={[faceX, CUP_Y, 0]}>
        <mesh geometry={cupGeo} rotation-z={rotZ} castShadow receiveShadow>
          <meshPhysicalMaterial ref={mats.cup} color={colors.material} metalness={0.35} roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.18} envMapIntensity={1.3} />
        </mesh>
        {/* touch-control ring */}
        <mesh position={[0.012 * sx, 0, 0]} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.31, 0.006, 12, 96]} />
          <meshStandardMaterial color={DARK} metalness={0.7} roughness={0.4} />
        </mesh>
        {/* power button + volume rocker (bottom edge) */}
        <mesh position={[-0.12 * sx, -CUP_R - 0.01, 0.12]} rotation-x={0}>
          <cylinderGeometry args={[0.03, 0.03, 0.03, 20]} />
          <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[-0.12 * sx, -CUP_R - 0.005, -0.1]}>
          <boxGeometry args={[0.04, 0.02, 0.14]} />
          <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.5} />
        </mesh>
        {/* USB-C port (left) / 3.5 mm jack (right) */}
        {s === 'L' ? (
          <mesh position={[-0.16 * sx, -CUP_R + 0.02, -0.26]} rotation-x={Math.PI / 2}>
            <capsuleGeometry args={[0.012, 0.03, 4, 12]} />
            <meshStandardMaterial color="#000" roughness={1} />
          </mesh>
        ) : (
          <mesh position={[-0.16 * sx, -CUP_R + 0.02, -0.26]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.018, 0.018, 0.03, 16]} />
            <meshStandardMaterial color="#000" roughness={1} />
          </mesh>
        )}
        {/* microphone ports */}
        {[0.35, -0.35].map((z) => (
          <mesh key={z} position={[-0.1 * sx, 0.3, z]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 10]} />
            <meshStandardMaterial color="#000" roughness={1} />
          </mesh>
        ))}
        {/* status LED */}
        <mesh position={[-0.08 * sx, -CUP_R + 0.06, 0.3]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshStandardMaterial color="#9ff3ff" emissive="#58e3ff" emissiveIntensity={2} />
        </mesh>
        {/* L / R marker inside the lip */}
        <mesh position={[-0.33 * sx, 0.3, 0]} rotation-z={rotZ}>
          <ringGeometry args={[0.02, 0.035, 16]} />
          <meshStandardMaterial ref={mats.detail2} color={colors.detail} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── outer cap / logo disc ── */}
      <group ref={setPart('cap', s)} position={[faceX + 0.012 * sx, CUP_Y, 0]}>
        <mesh rotation-z={rotZ}>
          <cylinderGeometry args={[0.2, 0.2, 0.012, 64]} />
          <meshStandardMaterial ref={mats.detail} color={colors.detail} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* embossed "A" */}
        <group position={[0.008 * sx, 0, 0]} rotation-y={(sx * Math.PI) / 2}>
          <mesh position={[-0.05, -0.01, 0]} rotation-z={0.5}>
            <boxGeometry args={[0.025, 0.18, 0.004]} />
            <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0.05, -0.01, 0]} rotation-z={-0.5}>
            <boxGeometry args={[0.025, 0.18, 0.004]} />
            <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <boxGeometry args={[0.08, 0.02, 0.004]} />
            <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ── PCB (right) / battery (left) — tucked between driver and shell ── */}
      {s === 'R' ? (
        <group ref={setPart('chip')} position={[cx + 0.08, CUP_Y, 0]}>
          <mesh rotation-y={Math.PI / 2}>
            <boxGeometry args={[0.3, 0.26, 0.012]} />
            <meshStandardMaterial color={PCB} roughness={0.6} metalness={0.1} />
          </mesh>
          <mesh position={[-0.012, 0.02, 0.02]} rotation-y={Math.PI / 2}>
            <boxGeometry args={[0.1, 0.1, 0.014]} />
            <meshStandardMaterial ref={mats.chip} color={colors.detail} emissive={colors.detail} emissiveIntensity={0.35} metalness={0.4} roughness={0.35} />
          </mesh>
          {[[-0.09, 0.08], [0.09, 0.08], [0.1, -0.08], [-0.1, -0.06], [0, -0.09]].map(([z, y], i) => (
            <mesh key={i} position={[-0.011, y, z]} rotation-y={Math.PI / 2}>
              <boxGeometry args={[0.035, 0.025, 0.012]} />
              <meshStandardMaterial color={i % 2 ? '#222' : '#c8c8c8'} metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
          {[-0.08, -0.04, 0, 0.04, 0.08].map((z) => (
            <mesh key={z} position={[-0.009, -0.12, z]} rotation-y={Math.PI / 2}>
              <boxGeometry args={[0.006, 0.02, 0.004]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.25} />
            </mesh>
          ))}
        </group>
      ) : (
        <group ref={setPart('battery')} position={[cx - 0.08, CUP_Y, 0]}>
          <mesh rotation-y={Math.PI / 2}>
            <boxGeometry args={[0.3, 0.24, 0.05]} />
            <meshStandardMaterial color="#9ea1a8" metalness={0.9} roughness={0.35} />
          </mesh>
          <mesh position={[-0.026, 0, 0]} rotation-y={Math.PI / 2}>
            <planeGeometry args={[0.26, 0.09]} />
            <meshStandardMaterial ref={mats.detail3} color={colors.detail} roughness={0.6} />
          </mesh>
          {[0.04, -0.04].map((z) => (
            <mesh key={z} position={[0, 0.135, z]}>
              <boxGeometry args={[0.02, 0.03, 0.012]} />
              <meshStandardMaterial color={z > 0 ? '#e0432f' : '#222'} roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* ── driver assembly ── */}
      <group ref={setPart('driver', s)} position={[cx - 0.06 * sx, CUP_Y, 0]}>
        {/* basket */}
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.33, 0.3, 0.05, 48, 1, true]} />
          <meshStandardMaterial color="#2a2735" metalness={0.9} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        {/* magnet */}
        <mesh position={[0.06 * sx, 0, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 48]} />
          <meshStandardMaterial color="#44404f" metalness={0.95} roughness={0.3} />
        </mesh>
        {/* copper voice coil */}
        <mesh position={[0.0, 0, 0]} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.14, 0.018, 12, 64]} />
          <meshStandardMaterial color={COPPER} metalness={1} roughness={0.28} />
        </mesh>
        {/* surround */}
        <mesh position={[-0.03 * sx, 0, 0]} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.27, 0.03, 16, 72]} />
          <meshStandardMaterial color="#1b1824" roughness={0.9} />
        </mesh>
        {/* titanium dome diaphragm */}
        <mesh position={[-0.02 * sx, 0, 0]} rotation-z={rotZ} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[0.26, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#d8d6e2" metalness={1} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} side={THREE.DoubleSide} />
        </mesh>
        {/* terminals */}
        {[0.05, -0.05].map((z) => (
          <mesh key={z} position={[0.12 * sx, -0.17, z]}>
            <boxGeometry args={[0.03, 0.03, 0.02]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ── acoustic grille ── */}
      <group ref={setPart('grille', s)} position={[cx - 0.2 * sx, CUP_Y, 0]}>
        <mesh rotation-y={(sx * Math.PI) / 2}>
          <circleGeometry args={[0.39, 64]} />
          <meshStandardMaterial color="#1a1722" metalness={0.8} roughness={0.45} alphaMap={tex.grille} transparent alphaTest={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.39, 0.012, 10, 72]} />
          <meshStandardMaterial color={DARK} metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* ── ear cushion ── */}
      <group ref={setPart('cushion', s)} position={[cx - 0.34 * sx, CUP_Y, 0]}>
        <mesh rotation-y={Math.PI / 2} scale={[1, 1.12, 0.82]} castShadow>
          <torusGeometry args={[0.3, 0.15, 32, 96]} />
          <meshStandardMaterial ref={mats.cushion} color={colors.cushion} roughness={0.92} metalness={0.02} bumpMap={tex.leather} bumpScale={0.004} />
        </mesh>
        {/* stitching */}
        <mesh position={[-0.12 * sx, 0, 0]} rotation-y={Math.PI / 2} scale={[1, 1.12, 1]}>
          <torusGeometry args={[0.3, 0.004, 8, 120]} />
          <meshStandardMaterial ref={mats.stitch} color={colors.detail} roughness={0.8} />
        </mesh>
        {/* inner fabric */}
        <mesh position={[0.02 * sx, 0, 0]} rotation-y={(sx * Math.PI) / 2}>
          <circleGeometry args={[0.2, 48]} />
          <meshStandardMaterial color="#1f1b29" roughness={1} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

/* ---------- full model ---------- */
const HeadphoneModel = forwardRef(function HeadphoneModel({ colors, explode, ...props }, ref) {
  const group = useRef()
  const parts = useRef({})
  const tex = useTextures()
  const cupGeo = useCupGeometry()
  const bandGeo = useBandGeometry(R, 0.075, 0.34, 0, Math.PI)
  const padGeo = useBandGeometry(R - 0.075, 0.07, 0.3, 0.28, Math.PI - 0.28, 60)

  // material refs grouped by role for smooth recolouring
  const shellMats = useRef(new Set())
  const cushionMats = useRef(new Set())
  const detailMats = useRef(new Set())
  const reg = (set) => (m) => m && set.current.add(m)
  const mats = useMemo(() => {
    const shell = reg(shellMats)
    const cushion = reg(cushionMats)
    const detail = reg(detailMats)
    return { shell, shell2: shell, shell3: shell, cup: shell, cushion, stitch: detail, detail, detail2: detail, detail3: detail, chip: detail }
  }, [])

  const targetMaterial = useMemo(() => new THREE.Color(colors.material), [colors.material])
  const targetCushion = useMemo(() => new THREE.Color(colors.cushion), [colors.cushion])
  const targetDetail = useMemo(() => new THREE.Color(colors.detail), [colors.detail])

  useImperativeHandle(ref, () => ({ group: group.current, parts: parts.current }))

  // keep the authored base position even if React re-attaches the ref mid-explode
  const setPart = (name, side) => (el) => {
    if (!el) return
    const key = name + (side || '')
    const prev = parts.current[key]
    parts.current[key] = { el, name, side, base: prev?.base ?? el.position.clone() }
  }

  useFrame(() => {
    shellMats.current.forEach((m) => m.color.lerp(targetMaterial, 0.08))
    cushionMats.current.forEach((m) => m.color.lerp(targetCushion, 0.08))
    detailMats.current.forEach((m) => {
      m.color.lerp(targetDetail, 0.08)
      if (m.emissive && m.emissiveIntensity > 0) m.emissive.lerp(targetDetail, 0.08)
    })
    const p = explode?.current ?? 0
    const e = p * p * (3 - 2 * p)
    Object.values(parts.current).forEach(({ el, name, side, base }) => {
      const off = EXPLODE[name]
      if (!off) return
      const sx = side === 'L' ? -1 : 1
      el.position.set(base.x + off.x * sx * e, base.y + off.y * e, base.z + off.z * e)
    })
  })

  const side = { colors, setPart, mats, tex, cupGeo }

  return (
    <group ref={group} {...props}>
      <group position={[0, 0.05, 0]}>
        {/* ── headband ── */}
        <group ref={setPart('headband')}>
          <mesh geometry={bandGeo} castShadow>
            <meshPhysicalMaterial ref={mats.shell} color={colors.material} metalness={0.4} roughness={0.3} clearcoat={0.7} clearcoatRoughness={0.2} envMapIntensity={1.2} />
          </mesh>
          <mesh geometry={padGeo} position={[0, -0.01, 0]}>
            <meshStandardMaterial ref={mats.cushion} color={colors.cushion} roughness={0.92} bumpMap={tex.leather} bumpScale={0.004} />
          </mesh>
          {/* stitching along the pad */}
          {[0.1, -0.1].map((z) => (
            <mesh key={z} position={[0, -0.01, z]} rotation-z={0.3}>
              <torusGeometry args={[R - 0.112, 0.004, 8, 100, Math.PI - 0.6]} />
              <meshStandardMaterial ref={mats.stitch} color={colors.detail} roughness={0.8} />
            </mesh>
          ))}
          {/* top logo plate */}
          <mesh position={[0, R + 0.035, 0]}>
            <boxGeometry args={[0.16, 0.006, 0.08]} />
            <meshStandardMaterial ref={mats.detail} color={colors.detail} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        <EarCup s="L" {...side} />
        <EarCup s="R" {...side} />
      </group>
    </group>
  )
})

/** Optional real GLB (Draco). Nodes are recoloured by name; see header comment. */
export function GLBHeadphone({ colors, explode, ...props }) {
  const { scene } = useGLTF(MODEL.url, true)
  const targetMaterial = useMemo(() => new THREE.Color(colors.material), [colors.material])
  useFrame(() => {
    const p = explode?.current ?? 0
    scene.traverse((o) => {
      if (o.isMesh && /Headband|Cup|Slider|Yoke/.test(o.name)) o.material.color.lerp(targetMaterial, 0.08)
      const key = o.name.replace(/[LR]$/, '').toLowerCase()
      const off = EXPLODE[key]
      if (!off) return
      if (o.userData.base === undefined) o.userData.base = o.position.clone()
      const sx = o.name.endsWith('L') ? -1 : 1
      o.position.set(o.userData.base.x + off.x * sx * p, o.userData.base.y + off.y * p, o.userData.base.z + off.z * p)
    })
  })
  return <primitive object={scene} {...props} />
}

export const Headphone = MODEL.USE_GLB ? GLBHeadphone : HeadphoneModel

/** Procedural studio lighting (no HDR download needed) */
export function StudioLights({ intensity = 1 }) {
  return (
    <>
      <ambientLight intensity={0.25 * intensity} />
      <spotLight position={[4, 7, 6]} angle={0.5} penumbra={0.8} intensity={60 * intensity} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0003} />
      <directionalLight position={[-6, 3, -4]} intensity={0.8 * intensity} color="#b9d7ff" />
      <pointLight position={[0, -3, 3]} intensity={6 * intensity} color="#ff8f8c" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -1]} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={2.5} rotation-y={Math.PI / 2} position={[-6, 1, -1]} scale={[8, 4, 1]} color="#c6f432" />
        <Lightformer form="rect" intensity={2.5} rotation-y={-Math.PI / 2} position={[6, 1, 0]} scale={[8, 4, 1]} color="#ff5e5b" />
        <Lightformer form="ring" intensity={3} position={[0, 2, 6]} scale={[4, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.5} rotation-x={-Math.PI / 2} position={[0, -5, 0]} scale={[12, 12, 1]} color="#7b2ff7" />
      </Environment>
    </>
  )
}

export default HeadphoneModel
