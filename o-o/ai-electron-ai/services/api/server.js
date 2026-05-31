const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

const PORT = Number(process.env.PORT || 3001)
const MONGO_URI = process.env.MONGO_URI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Initialize Gemini
if (!GEMINI_API_KEY) {
  console.warn('[api] GEMINI_API_KEY is not set in environment variables.') 
}
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

// Try common model names to avoid 404
const MODEL_NAMES = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro'
]
let model = null
if (genAI) {
  model = genAI.getGenerativeModel({ model: MODEL_NAMES[0] })
}

async function getAvailableModels() {
  if (!genAI) return []
  try {
    const result = await genAI.listModels()
    return result.map(m => m.name.replace('models/', ''))
  } catch (err) {
    console.error('[api] Failed to list models:', err.message)
    return []
  }
}

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
)

const Message = mongoose.model('Message', messageSchema)

function makeStubResponse(prompt) {
  const trimmed = String(prompt || '').trim()
  if (!trimmed) return 'Send a message and I will reply.'
  if (trimmed.length > 1000) return 'Message too long. Please shorten it.'

  const lower = trimmed.toLowerCase()
  if (lower.includes('hello') || lower.includes('hi')) return 'Hello! How can I help you today?'
  if (lower.includes('code')) return 'Tell me what you want to build, and I will generate a plan and code steps.'
  if (lower.includes('mongodb')) return 'Make sure MONGO_URI is set in your .env, then I can store messages in MongoDB.'

  return `AI (stub): ${trimmed}`
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'not_connected',
  })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {}
    const prompt = typeof message === 'string' ? message : ''

    let reply = ''
    if (genAI) {
      console.log(`[api] Attempting chat with model: gemini-2.5-flash`)
      try {
        const currentModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        const result = await currentModel.generateContent(prompt)
        const response = await result.response
        reply = response.text()
        console.log(`[api] Successfully used model: gemini-2.5-flash`)
      } catch (err) {
        console.error(`[api] Gemini API error:`, err.message)
        reply = `Error from Gemini: ${err.message}`
      }
    } else {
      reply = makeStubResponse(prompt)
    }

    if (mongoose.connection.readyState === 1) {
      await Message.create({ role: 'user', content: prompt })
      await Message.create({ role: 'assistant', content: reply })
    }

    res.json({ reply })
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

async function start() {
  if (MONGO_URI) {  
    try {
      await mongoose.connect(MONGO_URI)
      console.log('[api] Mongo connected')
    } catch (err) {
      console.warn('[api] Mongo connect failed; continuing without DB')
    }
  } else {
    console.warn('[api] MONGO_URI not set; running without DB')
  }

  app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`)
  })
}

start()
