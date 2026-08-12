import React, { useRef, useEffect, useState } from 'react'

const SNIPPETS = [
  {title:'Verse', text:'“Indeed, the most noble of you in the sight of Allah is the most righteous.” — Quran'},
  {title:'Du’a', text:'“Our Lord, give us in this world [that which is] good…”'},
  {title:'Name', text:'Ar-Rahman — The Most Merciful'},
  {title:'Hadith', text:'“Fear Allah wherever you are…” — Hadith'},
  {title:'Reflection', text:'What small act today counts as sincere worship?'}
];

function rand(min,max){return Math.random()*(max-min)+min}

export default function Game({onScore,onMessage}){
  const canvasRef = useRef(null)
  const onScoreRef = useRef(onScore)
  useEffect(()=>{ onScoreRef.current = onScore },[onScore])

  useEffect(()=>{
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d')
    let W = canvas.width = innerWidth; let H = canvas.height = innerHeight - 80
    function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight - 80 }
    addEventListener('resize', resize)

    const player = { x: W/2, y: H-80, r: 18 }
    const mouse = { x: player.x, y: player.y }
    let pointerDown = false
    const things = []
    let running = true

    function spawn(){ things.push({ x: rand(20,W-20), y:-20, r: rand(10,20), vy: rand(0.6,1.6), hue: rand(0,360) }) }
    const sp = setInterval(spawn, 900)

    function getCanvasPos(e){
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onPointerMove(e){
      const p = getCanvasPos(e)
      mouse.x = p.x
      mouse.y = p.y
    }
    function onPointerDown(e){ pointerDown = true; const p = getCanvasPos(e); mouse.x = p.x; mouse.y = p.y; try{ e.target.setPointerCapture(e.pointerId) }catch(_){} }
    function onPointerUp(e){ pointerDown = false; try{ e.target.releasePointerCapture(e.pointerId) }catch(_){} }
    // attach to canvas so pointer events are scoped and won't trigger page scrolling
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    let last = performance.now()
    function update(dt){
      player.x += (mouse.x - player.x) * 0.12
      player.y += (Math.min(H, mouse.y) - player.y) * 0.12
      for(let i=things.length-1;i>=0;i--){
        const t = things[i]; t.y += t.vy*dt
        if(t.y - t.r > H) things.splice(i,1)
        const dx = t.x - player.x; const dy = t.y - player.y; if(Math.hypot(dx,dy) < t.r + player.r){
            // collect without showing panel; notify parent for bottom bar
            const s = SNIPPETS[Math.floor(Math.random()*SNIPPETS.length)]
            things.splice(i,1)
            if(onScoreRef.current) onScoreRef.current(10)
            if(onMessage) onMessage(s.title + ' — ' + s.text)
        }
      }
    }

    function render(){
      ctx.clearRect(0,0,W,H)
      for(let i=0;i<80;i++){ const x=(i*97)%W; const y=(i*53)%H; ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(x,y,1,1) }
      for(const t of things){ ctx.beginPath(); ctx.fillStyle = `hsl(${t.hue} 80% 60%)`; ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.fill(); }
      const g = ctx.createRadialGradient(player.x,player.y,6,player.x,player.y,60); g.addColorStop(0,'#bffaff'); g.addColorStop(1,'rgba(120,200,255,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(player.x,player.y,player.r+8,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(player.x,player.y,player.r,0,Math.PI*2); ctx.fill()
    }

    function loop(now){ if(!running) return; const dt = Math.min(32, now-last); last=now; update(dt/16); render(); requestAnimationFrame(loop) }
    requestAnimationFrame(loop)

    return ()=>{
      running=false; clearInterval(sp);
      removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    }
  },[])

  // messages removed: no on-screen panel shown when collecting items

  return (
    <div className="game-wrap">
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  )
}
