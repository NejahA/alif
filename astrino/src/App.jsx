import React, {useState, useEffect} from 'react'
import Game from './game/Game'

export default function App(){
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  // auto-clear message after 2s
  useEffect(()=>{
    if(!message) return
    const t = setTimeout(()=> setMessage(''), 2000)
    return ()=> clearTimeout(t)
  },[message])

  return (
    <div className="app-root">
      <header>
        <h1>Astrino</h1>
        <div className="hud">
          <span>Score: {score}</span>
          <button className="mute">🔊</button>
        </div>
      </header>
      <main>
        <Game onScore={v=>setScore(s=>s+v)} onMessage={m=>setMessage(m)} />
      </main>
      <div className="bottom-bar">{message}</div>
    </div>
  )
}
