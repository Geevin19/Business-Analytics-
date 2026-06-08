"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useScrollProgress } from "./scroll-context"

// brighter, more saturated palette so the cubes read as data, not gray noise
const COLORS = ["#3ee0d8", "#57e98a", "#e8c45a", "#9b8cff"]

// ---- one consistent cast of particles, morphed between story "shapes" ----
const GRID = 12 // bar-chart grid side
const PER_COL = 5 // particles stacked per bar
const COUNT = GRID * GRID * PER_COL // 720 particles — far less clutter

function damp(c: number, t: number, l: number, dt: number) {
  return THREE.MathUtils.damp(c, t, l, dt)
}

// Build every target shape once. Each particle index keeps its identity across
// shapes, so the cloud visibly assembles / morphs / explodes instead of swapping.
function useShapes() {
  return useMemo(() => {
    const scatter = new Float32Array(COUNT * 3)
    const bars = new Float32Array(COUNT * 3)
    const globe = new Float32Array(COUNT * 3)
    const wave = new Float32Array(COUNT * 3)
    const burst = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const tmp = new THREE.Color()

    // varied bar heights -> a believable "skyline" of metrics
    const colHeight: number[] = []
    for (let c = 0; c < GRID * GRID; c++) {
      colHeight[c] = 0.22 + Math.pow(Math.random(), 1.5) * 0.42
    }

    const golden = Math.PI * (1 + Math.sqrt(5))

    for (let i = 0; i < COUNT; i++) {
      // 1. SCATTER — raw data, kept as a hollow shell so the center stays
      // clear and the headline never fights the cubes
      const sr = 6.5 + Math.random() * 3.5
      const st = Math.acos(2 * Math.random() - 1)
      const sp = Math.random() * Math.PI * 2
      scatter[i * 3] = sr * Math.sin(st) * Math.cos(sp)
      scatter[i * 3 + 1] = sr * Math.sin(st) * Math.sin(sp) * 0.7
      scatter[i * 3 + 2] = sr * Math.cos(st)

      // 2. BARS — organized metric skyline
      const col = Math.floor(i / PER_COL)
      const within = i % PER_COL
      const cx = col % GRID
      const cz = Math.floor(col / GRID)
      const sp2 = colHeight[col]
      bars[i * 3] = (cx - (GRID - 1) / 2) * 0.55
      bars[i * 3 + 1] = within * sp2 - 1.2
      bars[i * 3 + 2] = (cz - (GRID - 1) / 2) * 0.55

      // 3. GLOBE — global reach
      const gy = 1 - (i / (COUNT - 1)) * 2
      const gr = Math.sqrt(1 - gy * gy)
      const gth = golden * i
      globe[i * 3] = Math.cos(gth) * gr * 3.3
      globe[i * 3 + 1] = gy * 3.3
      globe[i * 3 + 2] = Math.sin(gth) * gr * 3.3

      // 4. WAVE — rising forecast surface
      const XN = 36
      const gx = i % XN
      const gz = Math.floor(i / XN)
      const ZN = Math.ceil(COUNT / XN)
      const fx = (gx / (XN - 1)) * 9 - 4.5
      wave[i * 3] = fx
      wave[i * 3 + 1] =
        Math.sin(gx * 0.5) * 0.4 + (gx / XN) * 3.4 - 1.4 + Math.sin(gz * 0.6) * 0.2
      wave[i * 3 + 2] = (gz - (ZN - 1) / 2) * 0.28

      // 5. BURST — explosion of insight
      const bx = Math.random() * 2 - 1
      const by = Math.random() * 2 - 1
      const bz = Math.random() * 2 - 1
      const bl = Math.hypot(bx, by, bz) || 1
      const br = 8 + Math.random() * 7
      burst[i * 3] = (bx / bl) * br
      burst[i * 3 + 1] = (by / bl) * br
      burst[i * 3 + 2] = (bz / bl) * br

      tmp.set(COLORS[i % COLORS.length])
      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }

    return { scatter, bars, globe, wave, burst, colors }
  }, [])
}

// keyframes: scroll progress -> which shape, tuned so each shape is fully
// formed when its matching section is centered (measured in the browser)
const KEYS = [
  { p: 0.0, s: "scatter" },
  { p: 0.06, s: "scatter" },
  { p: 0.15, s: "bars" },
  { p: 0.23, s: "bars" }, // metrics centered ~0.18
  { p: 0.31, s: "globe" },
  { p: 0.41, s: "globe" }, // reach centered ~0.36
  { p: 0.49, s: "wave" },
  { p: 0.59, s: "wave" }, // forecast centered ~0.54
  { p: 0.79, s: "wave" }, // hold through pricing ~0.76
  { p: 0.92, s: "burst" },
  { p: 1.0, s: "burst" }, // cta centered ~0.97
] as const

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

function ParticleSystem() {
  const progress = useScrollProgress()
  const shapes = useShapes()
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const a = useMemo(() => new THREE.Vector3(), [])
  const b = useMemo(() => new THREE.Vector3(), [])

  // set per-instance colors once
  const onInit = (inst: THREE.InstancedMesh | null) => {
    if (!inst || inst.userData.colored) return
    const c = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      c.setRGB(shapes.colors[i * 3], shapes.colors[i * 3 + 1], shapes.colors[i * 3 + 2])
      inst.setColorAt(i, c)
    }
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
    inst.userData.colored = true
  }

  useFrame((_, dt) => {
    const inst = mesh.current
    if (!inst) return
    const p = progress

    // find current keyframe segment + blend factor
    let k = 0
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (p >= KEYS[i].p && p <= KEYS[i + 1].p) {
        k = i
        break
      }
      if (p > KEYS[KEYS.length - 1].p) k = KEYS.length - 2
    }
    const seg = KEYS[k]
    const next = KEYS[k + 1]
    const local = (p - seg.p) / (next.p - seg.p || 1)
    const blend = smoothstep(Math.min(1, Math.max(0, local)))
    const from = shapes[seg.s as keyof typeof shapes] as Float32Array
    const to = shapes[next.s as keyof typeof shapes] as Float32Array

    // a little life so held shapes still breathe
    const time = performance.now() * 0.001
    const wobble = seg.s === next.s ? 0.05 : 0

    for (let i = 0; i < COUNT; i++) {
      a.set(from[i * 3], from[i * 3 + 1], from[i * 3 + 2])
      b.set(to[i * 3], to[i * 3 + 1], to[i * 3 + 2])
      a.lerp(b, blend)
      if (wobble) {
        a.y += Math.sin(time * 1.5 + i * 0.3) * wobble
      }
      dummy.position.copy(a)
      const s = 0.13
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true

    // whole system slowly rotates; spins faster on the globe beat
    const spin = 0.12 + (p > 0.3 && p < 0.46 ? 0.4 : 0)
    inst.rotation.y += dt * spin
  })

  return (
    <instancedMesh
      ref={(r) => {
        mesh.current = r
        onInit(r)
      }}
      args={[undefined, undefined, COUNT]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        vertexColors
        emissive="#ffffff"
        emissiveIntensity={0.18}
        metalness={0.35}
        roughness={0.35}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

// faint structural core the particles orbit — gives the system an anchor,
// then expands and fades during the final burst
function Core() {
  const ref = useRef<THREE.Mesh>(null)
  const progress = useScrollProgress()
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.1
    ref.current.rotation.x += dt * 0.04
    const burst = Math.max(0, (progress - 0.82) / 0.18)
    const target = 2.4 + burst * 9
    ref.current.scale.setScalar(damp(ref.current.scale.x, target, 3, dt))
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.opacity = damp(m.opacity, 0.12 * (1 - burst), 3, dt)
  })
  return (
    <mesh ref={ref} scale={2.4}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#34d6d0" wireframe transparent opacity={0.12} />
    </mesh>
  )
}

function Rig() {
  const progress = useScrollProgress()
  useFrame((state, dt) => {
    const p = progress
    const cam = state.camera
    const angle = p * Math.PI * 0.7
    const radius = 11 - Math.sin(p * Math.PI) * 2.5
    cam.position.x = damp(cam.position.x, Math.sin(angle) * radius, 2.5, dt)
    cam.position.y = damp(cam.position.y, 1.5 + Math.sin(p * Math.PI) * 1.5, 2.5, dt)
    cam.position.z = damp(cam.position.z, Math.cos(angle) * radius, 2.5, dt)
    cam.lookAt(0, 0.3, 0)
  })
  return null
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 z-0 h-screen w-full">
      <Canvas camera={{ position: [0, 1.5, 11], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={["#0b1220"]} />
        <fog attach="fog" args={["#0b1220", 12, 26]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={2} color="#9fe8ff" />
        <pointLight position={[-6, 2, -4]} intensity={70} color="#4fd17a" />
        <pointLight position={[6, -2, 4]} intensity={60} color="#34d6d0" />
        <pointLight position={[0, 6, 2]} intensity={50} color="#ffffff" />
        <Core />
        <ParticleSystem />
        <Rig />
      </Canvas>
    </div>
  )
}
