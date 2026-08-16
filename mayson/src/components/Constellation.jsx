import React, { useRef, useEffect, useState } from 'react'

export default function Gravity({ wells, onAddWell, onRemoveWell, onUpdateWell, particleCount, speed }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const draggingRef = useRef(null)
  const animationRef = useRef(null)

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      trail: [],
      life: 1
    }))
  }, [particleCount])

  // Physics + Rendering
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
    const G = 0.5 // Gravity constant

    const update = () => {
      // Clear background
      ctx.fillStyle = '#0a0e27'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw wells
      for (let well of wells) {
        // Glow
        const gradient = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, 60)
        gradient.addColorStop(0, well.color + '30')
        gradient.addColorStop(1, well.color + '00')
        ctx.fillStyle = gradient
        ctx.fillRect(well.x - 60, well.y - 60, 120, 120)

        // Core
        ctx.fillStyle = well.color
        ctx.beginPath()
        ctx.arc(well.x, well.y, 8, 0, Math.PI * 2)
        ctx.fill()

        // Ring
        ctx.strokeStyle = well.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.arc(well.x, well.y, 25, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Physics
      for (let particle of particlesRef.current) {
        let fx = 0, fy = 0

        // Apply gravity from each well
        for (let well of wells) {
          const dx = well.x - particle.x
          const dy = well.y - particle.y
          const distSq = dx * dx + dy * dy + 100 // Avoid singularity
          const dist = Math.sqrt(distSq)
          const f = (G * well.mass) / distSq

          fx += (f * dx) / dist
          fy += (f * dy) / dist
        }

        // Apply forces
        particle.vx += fx * speed
        particle.vy += fy * speed
        particle.vx *= 0.99 // Drag
        particle.vy *= 0.99

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Trail
        particle.trail.push({ x: particle.x, y: particle.y })
        if (particle.trail.length > 40) particle.trail.shift()

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -0.8
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -0.8
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))
      }

      // Draw particles
      for (let particle of particlesRef.current) {
        // Trail
        if (particle.trail.length > 1) {
          ctx.strokeStyle = 'rgba(126, 231, 255, 0.3)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
          for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y)
          }
          ctx.stroke()
        }

        // Particle
        ctx.fillStyle = '#7ee7ff'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2)
        ctx.fill()

        // Glow
        ctx.fillStyle = 'rgba(126, 231, 255, 0.4)'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(update)
    }

    animationRef.current = requestAnimationFrame(update)

    // Mouse controls
    const handleMouseDown = (e) => {
      if (e.button === 2) {
        // Right click - repel
        e.preventDefault()
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        onAddWell(x, y, 'repel')
        return
      }

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if clicked on well
      for (let well of wells) {
        const dist = Math.hypot(well.x - x, well.y - y)
        if (dist < 20) {
          draggingRef.current = well.id
          return
        }
      }

      // Left click - attract
      onAddWell(x, y, 'attract')
    }

    const handleMouseMove = (e) => {
      if (draggingRef.current !== null) {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const well = wells.find(w => w.id === draggingRef.current)
        if (well) {
          onUpdateWell(well.id, { x, y })
        }
      }
    }

    const handleMouseUp = () => {
      draggingRef.current = null
    }

    const handleContextMenu = (e) => e.preventDefault()

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [wells, onAddWell, onUpdateWell, speed])

  return <canvas ref={canvasRef} className="gravity-canvas" />
}

