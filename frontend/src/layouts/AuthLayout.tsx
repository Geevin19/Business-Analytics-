import { Outlet, Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { useEffect, useRef } from 'react'
import styles from './AuthLayout.module.css'

function AuthCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    const COUNT = 180
    const COLORS = ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
    const scatter = new Float32Array(COUNT * 3)
    const colors  = new Uint8Array(COUNT * 3)

    function hex2rgb(h: string): [number, number, number] {
      return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]
    }

    for (let i = 0; i < COUNT; i++) {
      const sr = 4 + Math.random() * 4
      const st = Math.acos(2 * Math.random() - 1)
      const sp = Math.random() * Math.PI * 2
      scatter[i*3]   = sr * Math.sin(st) * Math.cos(sp)
      scatter[i*3+1] = sr * Math.sin(st) * Math.sin(sp) * 0.7
      scatter[i*3+2] = sr * Math.cos(st)
      const [r,g,b] = hex2rgb(COLORS[i % COLORS.length])
      colors[i*3]=r; colors[i*3+1]=g; colors[i*3+2]=b
    }

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    function project(x: number, y: number, z: number, camAngle: number) {
      const cosA = Math.cos(camAngle), sinA = Math.sin(camAngle)
      const rx =  cosA*x + sinA*z
      const ry =  y
      const rz = -sinA*x + cosA*z + 8
      if (rz < 0.5) return null
      const scale = (canvas.height * 0.75) / rz
      return { sx: canvas.width/2 + rx*scale, sy: canvas.height/2 - ry*scale, scale, depth: rz }
    }

    function drawCube(sx: number, sy: number, scale: number, r: number, g: number, b: number, depth: number) {
      const sz = Math.max(0.3, 0.032 * scale)
      const fog = Math.max(0, Math.min(1, 1 - (depth - 4) / 14))
      const alpha = fog * 0.7
      if (alpha < 0.04) return
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = `rgb(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+60)})`
      ctx.fillRect(sx - sz, sy - sz*1.4, sz*2, sz*0.7)
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(sx - sz, sy - sz*0.7, sz*2, sz*1.8)
      ctx.fillStyle = `rgb(${Math.floor(r*0.6)},${Math.floor(g*0.6)},${Math.floor(b*0.6)})`
      ctx.fillRect(sx + sz, sy - sz*1.4, sz*0.7, sz*2.1)
      ctx.restore()
    }

    let rotY = 0, time = 0
    function draw() {
      raf = requestAnimationFrame(draw)
      time += 0.008
      rotY += 0.003
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      type Item = { sx:number; sy:number; scale:number; r:number; g:number; b:number; depth:number }
      const items: Item[] = []
      for (let i = 0; i < COUNT; i++) {
        const wx = scatter[i*3]   + Math.sin(time + i*0.4) * 0.15
        const wy = scatter[i*3+1] + Math.cos(time*0.7 + i*0.3) * 0.1
        const wz = scatter[i*3+2]
        const pr = project(wx, wy, wz, rotY)
        if (!pr) continue
        items.push({ ...pr, r: colors[i*3], g: colors[i*3+1], b: colors[i*3+2] })
      }
      items.sort((a,b) => b.depth - a.depth)
      for (const it of items) drawCube(it.sx, it.sy, it.scale, it.r, it.g, it.b, it.depth)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className={styles.canvas} />
}

export default function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <AuthCanvas />
      <div className={styles.veil} />
      <div className={styles.glow1} />
      <div className={styles.glow2} />
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <div className={styles.brandIcon}><Activity size={18} strokeWidth={2.5} /></div>
          <span className={styles.brandName}>BizAnalytics</span>
        </Link>
        <div className={styles.card}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
