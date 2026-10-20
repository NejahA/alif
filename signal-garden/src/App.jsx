import { useEffect, useMemo, useState } from 'react'
import './App.css'

const moods = [
  { name: 'Clear', icon: 'sun', color: '#e7b96e' },
  { name: 'Tender', icon: 'bloom', color: '#d593a9' },
  { name: 'Low', icon: 'cloud', color: '#8ba4b4' },
  { name: 'Restless', icon: 'wave', color: '#b6a0d0' },
  { name: 'Bright', icon: 'spark', color: '#dd875f' },
]

export default function App() {
  const [selectedMood, setSelectedMood] = useState(() => localStorage.getItem('garden-mood') || '')
  const [intention, setIntention] = useState(() => localStorage.getItem('garden-intention') || '')
  const [saved, setSaved] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [entries, setEntries] = useState(() => Number(localStorage.getItem('garden-entries') || 3))
  const [note, setNote] = useState(() => localStorage.getItem('garden-note') || '')
  const [rituals, setRituals] = useState(() => JSON.parse(localStorage.getItem('garden-rituals') || '[false,false,false]'))
  const [seconds, setSeconds] = useState(300)
  const [running, setRunning] = useState(false)
  const [wins, setWins] = useState(() => JSON.parse(localStorage.getItem('garden-wins') || '[]'))
  const [winDraft, setWinDraft] = useState('')
  const [moodHistory, setMoodHistory] = useState(() => JSON.parse(localStorage.getItem('garden-mood-history') || '[]'))
  const [energy, setEnergy] = useState(() => Number(localStorage.getItem('garden-energy') || 3))
  const current = useMemo(() => moods.find((mood) => mood.name === selectedMood), [selectedMood])

  useEffect(() => { localStorage.setItem('garden-mood', selectedMood) }, [selectedMood])
  useEffect(() => { localStorage.setItem('garden-intention', intention) }, [intention])
  useEffect(() => { localStorage.setItem('garden-note', note) }, [note])
  useEffect(() => { localStorage.setItem('garden-rituals', JSON.stringify(rituals)) }, [rituals])
  useEffect(() => { localStorage.setItem('garden-wins', JSON.stringify(wins)) }, [wins])
  useEffect(() => { localStorage.setItem('garden-mood-history', JSON.stringify(moodHistory)) }, [moodHistory])
  useEffect(() => { localStorage.setItem('garden-energy', energy) }, [energy])
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { setRunning(false); window.setTimeout(() => window.alert('Your reset is complete. Take one slow breath before you continue.'), 0); return 0 }; return value - 1 }), 1000); return () => window.clearInterval(timer) }, [running])

  function plantIntention() {
    if (!intention.trim() && !selectedMood) return
    setEntries((value) => { const next = value + 1; localStorage.setItem('garden-entries', next); return next })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }
  function getPrompt() {
    const prompts = ['What can wait until tomorrow?', 'What is already enough?', 'Where could you make five quiet minutes?', 'What would a kind next step look like?']
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)])
  }
  function toggleRitual(index) { setRituals((items) => items.map((item, itemIndex) => itemIndex === index ? !item : item)) }
  function addWin(event) { event.preventDefault(); if (!winDraft.trim()) return; setWins((items) => [winDraft.trim(), ...items].slice(0, 4)); setWinDraft('') }
  function chooseMood(name) { setSelectedMood(name); setMoodHistory((items) => [{ name, day: new Date().toLocaleDateString('en-US', { weekday: 'short' }) }, ...items].slice(0, 7)) }
  function setFocus(minutes) { setRunning(false); setSeconds(minutes * 60) }
  function exportGarden() { const data = { mood: selectedMood, intention, note, rituals, wins, moodHistory, exportedAt: new Date().toISOString() }; const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'signal-garden-backup.json'; link.click(); URL.revokeObjectURL(url) }
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return <main className="garden-app">
    <aside className="side"><div className="logo">signal <i>garden</i></div><nav><button className="active">Today</button><button>Garden</button><button>Patterns</button></nav><div className="date">FRIDAY<br /><strong>16 OCTOBER</strong></div></aside>
    <section className="content"><header><div><p className="eyebrow">A SMALL DAILY PRACTICE</p><h1>How are you arriving?</h1><p className="subtitle">Notice the signals. Keep what helps you grow.</p></div><div className="header-actions"><button className="quiet" onClick={exportGarden}>Export garden</button><button className="quiet" onClick={getPrompt}>A prompt for now</button></div></header>
      {prompt && <div className="prompt"><span>FOR THIS MOMENT</span>{prompt}<button onClick={() => setPrompt('')}>x</button></div>}
      <section className="arrive"><div><p className="eyebrow">TODAY'S CHECK-IN</p><h2>Make room for the real answer.</h2><p>Pick the feeling that has the most gravity right now. There is no wrong weather.</p></div><div><div className="moods">{moods.map((mood) => <button key={mood.name} onClick={() => chooseMood(mood.name)} className={selectedMood === mood.name ? 'picked' : ''} style={{ '--mood': mood.color }}><i>{mood.icon[0]}</i>{mood.name}</button>)}</div><label className="energy">Energy <input type="range" min="1" max="5" value={energy} onChange={(event) => setEnergy(Number(event.target.value))} /><b>{energy}/5</b></label></div></section>
      <section className="dashboard"><div className="panel intention"><p className="eyebrow">ONE INTENTION</p><textarea value={intention} onChange={(event) => setIntention(event.target.value)} placeholder="What would feel nourishing today?" /><div><button className="plant" onClick={plantIntention}>Plant intention</button>{saved && <span className="success">Gently saved</span>}</div></div>
        <div className="panel garden"><p className="eyebrow">YOUR GARDEN</p><div className="plot">{Array.from({ length: Math.min(entries, 12) }, (_, index) => <span className="plant-shape" key={index} style={{ left: `${8 + index * 8}%`, height: `${32 + (index % 4) * 14}px` }} />)}<b>{current ? current.icon : 'grow'}</b></div><div className="garden-stat"><strong>{entries} day gentle streak</strong><span>Watered by check-ins</span></div></div></section>
      <section className="extras"><div className="panel note"><p className="eyebrow">A NOTE FOR LATER</p><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="A small detail worth keeping..." /><span>Saved privately on this device</span></div><div className="panel ritual"><p className="eyebrow">GENTLE RITUALS</p>{['Drink water', 'Step outside', 'Close one open loop'].map((ritual, index) => <button key={ritual} onClick={() => toggleRitual(index)} className={rituals[index] ? 'done' : ''}><i>{rituals[index] ? '✓' : ''}</i>{ritual}</button>)}</div><div className="panel pulse"><p className="eyebrow">WEEKLY RHYTHM</p><div className="bars">{[44, 69, 53, 82, 64, 35, 0].map((height, index) => <span key={index}><i style={{ height: `${height}%` }}></i><b>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</b></span>)}</div><small>Your energy is rising.</small></div><div className="panel focus"><p className="eyebrow">FOCUS RESET</p><strong>{time}</strong><p>{running ? 'Stay with one small thing.' : 'Make a little space to begin.'}</p><div>{[5, 10, 25].map((minutes) => <button key={minutes} className="reset" onClick={() => setFocus(minutes)}>{minutes}m</button>)}</div><button className="plant" onClick={() => setRunning((value) => !value)}>{running ? 'Pause reset' : 'Start reset'}</button><button className="reset" onClick={() => setFocus(5)}>Reset</button></div></section>
      <section className="wins panel"><p className="eyebrow">SMALL WINS</p><form onSubmit={addWin}><input value={winDraft} onChange={(event) => setWinDraft(event.target.value)} placeholder="Name one thing that went well..." /><button className="plant">Keep it</button></form>{wins.length ? <div className="win-list">{wins.map((win, index) => <span key={`${win}-${index}`}>+ {win}<button onClick={() => setWins((items) => items.filter((_, itemIndex) => itemIndex !== index))}>x</button></span>)}</div> : <small>Small counts. Especially small.</small>}</section>
      {moodHistory.length > 0 && <section className="history panel"><p className="eyebrow">RECENT WEATHER</p><div>{moodHistory.map((item, index) => <span key={`${item.name}-${index}`} className={item.name.toLowerCase()}><b>{item.day}</b>{item.name}</span>)}</div></section>}
      <section className="reflection"><div><p className="eyebrow">A QUIET PATTERN</p><h2>Your clearest days begin slowly.</h2><p>On the days you check in before 10am, you tend to choose fewer things — and finish more of them.</p></div><button onClick={getPrompt}>Give me a prompt →</button></section>
    </section>
  </main>
}
