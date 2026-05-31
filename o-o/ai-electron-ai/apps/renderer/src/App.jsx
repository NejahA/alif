import { useMemo, useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isSending, setIsSending] = useState(false)

  const platform = useMemo(() => {
    try {
      return window?.desktop?.platform
    } catch {
      return undefined
    }
  }, [])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isSending) return

    setIsSending(true)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      const reply = typeof data?.reply === 'string' ? data.reply : 'No reply'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: backend not reachable.' },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <section id="center">
        <div>
          <h1>AI App</h1>
          <p>
            React + Express + MongoDB{platform ? ` (${platform})` : ''}. Type a
            message to test the chat endpoint.
          </p>
        </div>

        <div className="chat">
          <div className="chat-log" role="log" aria-label="Chat messages">
            {messages.length === 0 ? (
              <div className="chat-empty">No messages yet.</div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`chat-msg ${m.role === 'user' ? 'user' : 'assistant'}`}
                >
                  <div className="chat-role">{m.role}</div>
                  <div className="chat-content">{m.content}</div>
                </div>
              ))
            )}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
              }}
              placeholder="Send a message…"
              disabled={isSending}
            />
            <button className="counter" onClick={sendMessage} disabled={isSending}>
              {isSending ? 'Sending…' : 'Send'}
            </button>
            <button
              className="counter"
              onClick={() => setMessages([])}
              disabled={isSending || messages.length === 0}
            >
              Clear
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
