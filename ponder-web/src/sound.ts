// Ponder dynamic 8-bit Audio Synthesizer using Web Audio API

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  return audioCtx
}

// Global toggle state stored in LocalStorage
const SOUND_TOGGLE_KEY = 'ponder_sound_enabled'

export function isSoundEnabled(): boolean {
  const enabled = localStorage.getItem(SOUND_TOGGLE_KEY)
  return enabled !== 'false' // Default is true
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_TOGGLE_KEY, enabled ? 'true' : 'false')
}

// 1. Play Soft Card Flip Sweep
export function playFlipSound() {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(150, now)
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.15)

  gainNode.gain.setValueAtTime(0.08, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

  osc.connect(gainNode)
  gainNode.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.15)
}

// 2. Play Successful Recall Chime (Ascending major chord)
export function playSuccessSound() {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const playTone = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)

    gainNode.gain.setValueAtTime(0.06, start)
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + duration)
  }

  // Play ascending C major arpeggio: C5 -> E5 -> G5 -> C6
  playTone(523.25, now, 0.12)       // C5
  playTone(659.25, now + 0.08, 0.12) // E5
  playTone(783.99, now + 0.16, 0.12) // G5
  playTone(1046.50, now + 0.24, 0.25) // C6
}

// 3. Play Failed Recall Alarm (Descending minor chord)
export function playFailureSound() {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const playTone = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sawtooth' // Arcade feel
    osc.frequency.setValueAtTime(freq, start)

    // Apply a simple lowpass filter to make sawtooth warmer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, start)

    gainNode.gain.setValueAtTime(0.04, start)
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)

    osc.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + duration)
  }

  // Descending minor chord alert
  playTone(293.66, now, 0.15)        // D4
  playTone(220.00, now + 0.12, 0.25) // A3
}

// 4. Play ticking click for Pomodoro alerts
export function playTickSound() {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, now)

  gainNode.gain.setValueAtTime(0.02, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

  osc.connect(gainNode)
  gainNode.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.03)
}

// 5. Play alarm siren on Pomodoro end
export function playAlarmSound() {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const playTone = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)
    // Add vibrato
    osc.frequency.linearRampToValueAtTime(freq + 30, start + duration * 0.5)
    osc.frequency.linearRampToValueAtTime(freq - 30, start + duration)

    gainNode.gain.setValueAtTime(0.08, start)
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + duration)
  }

  // Two loud alarm beeps
  playTone(880, now, 0.25)
  playTone(880, now + 0.35, 0.35)
}

// 6. Play Session Completed Fanfare
export function playFanfareSound() {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const playTone = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, start)

    gainNode.gain.setValueAtTime(0.06, start)
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + duration)
  }

  // Triumphant arpeggio
  playTone(523.25, now, 0.15)         // C5
  playTone(659.25, now + 0.10, 0.15)  // E5
  playTone(783.99, now + 0.20, 0.15)  // G5
  playTone(1046.50, now + 0.30, 0.15) // C6
  playTone(1318.51, now + 0.40, 0.15) // E6
  playTone(1567.98, now + 0.50, 0.5)  // G6
}
