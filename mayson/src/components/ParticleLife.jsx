import React, { useRef, useEffect } from 'react'

export default function ParticleLife({ particleTypes, rules, speed, viscosity }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationRef = useRef(null)

  // Initialize particles
  useEffect(() => {
    const particles = []
    let id = 0
    for (let type of particleTypes) {
      for (let i = 0; i < type.count; i++) {
        particles.push({
          id: id++,
          type: type.id,
          color: type.color,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: 0,
          vy: 0
        })
      }
    }
    particlesRef.current = particles
  }, [particleTypes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth - 280
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const ctx = canvas.getContext('2d')
    const FORCE_DISTANCE = 80
    const MAX_FORCE = 5

    const update = () => {
      // Clear background
      ctx.fillStyle = '#0a0e27'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current

      // Calculate forces and update particles
      for (let p of particles) {
        let fx = 0, fy = 0

        // Check forces from all other particles
        for (let other of particles) {
          if (p.id === other.id) continue

          const dx = other.x - p.x
          const dy = other.y - p.y
          const distSq = dx * dx + dy * dy
          const dist = Math.sqrt(distSq) + 0.1 // Avoid division by zero

          if (dist < FORCE_DISTANCE) {
            // Get attraction/repulsion rule
            const ruleKey = `${p.type}_${other.type}`
            const attraction = rules[ruleKey] || 0

            // Calculate force (decays with distance)
            const nDist = dist / FORCE_DISTANCE
            const f = attraction * (1 - nDist) / dist

            fx += f * dx
            fy += f * dy
          }
        }

        // Apply force (clamped)
        const forceMag = Math.sqrt(fx * fx + fy * fy)
        if (forceMag > MAX_FORCE) {
          fx = (fx / forceMag) * MAX_FORCE
          fy = (fy / forceMag) * MAX_FORCE
        }

        p.vx += fx * speed
        p.vy += fy * speed

        // Apply viscosity (friction)
        p.vx *= viscosity
        p.vy *= viscosity

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }

      // Draw particles
      for (let p of particles) {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()

        // Glow
        ctx.fillStyle = p.color + '40'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(update)
    }

    animationRef.current = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [rules, speed, viscosity])

  return <canvas ref={canvasRef} className="particle-life-canvas" />
}
