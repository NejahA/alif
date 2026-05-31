const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const PORT = process.env.PORT || 3001
const MONGO_URI = process.env.MONGO_URI

const app = express()

app.use(cors())
app.use(express.json())

// Dinosaur Schema
const dinosaurSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  diet: { type: String, enum: ['Carnivore', 'Herbivore', 'Omnivore'], required: true },
  period: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  dangerLevel: { type: Number, min: 1, max: 5, default: 3 },
  roar: { type: String, default: 'RAWR!' },
  funFact: { type: String }
})

const Dinosaur = mongoose.model('Dinosaur', dinosaurSchema)

// Seed data function
async function seedData(force = false) {
  const count = await Dinosaur.countDocuments()
  if (count === 0 || force) {
    if (force) {
      await Dinosaur.deleteMany({})
      console.log('[api] Clearing existing dinosaur records...')
    }
    const initialDinos = [
      {
        name: 'T-Rex',
        species: 'Tyrannosaurus Rex',
        diet: 'Carnivore',
        period: 'Late Cretaceous',
        dangerLevel: 5,
        roar: 'ROOOOOOAAAAAAARRRRR!!!',
        funFact: 'T-Rex had the strongest bite force of any land animal that ever lived.',
        description: 'The "King of the Tyrant Lizards," one of the largest land predators ever.',
        image: 'https://images.unsplash.com/photo-1562591176-3293099a01a4?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Triceratops',
        species: 'Triceratops horridus',
        diet: 'Herbivore',
        period: 'Late Cretaceous',
        dangerLevel: 3,
        roar: 'GRRRR-HRNNNN!',
        funFact: 'A Triceratops skull could grow up to 8 feet long, nearly one-third the length of its entire body.',
        description: 'A large herbivore with a distinctive three-horned face and massive bony frill.',
        image: 'https://images.unsplash.com/photo-1517923332225-1a402d9b9907?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Velociraptor',
        species: 'Velociraptor mongoliensis',
        diet: 'Carnivore',
        period: 'Late Cretaceous',
        dangerLevel: 4,
        roar: 'SCREEEEE-CHIRP!',
        funFact: 'Actual Velociraptors were about the size of a large turkey and were covered in feathers.',
        description: 'A small but highly intelligent feathered predator that hunted in packs.',
        image: 'https://images.unsplash.com/photo-1559967443-19bd5caa290f?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Spinosaurus',
        species: 'Spinosaurus aegyptiacus',
        diet: 'Carnivore',
        period: 'Late Cretaceous',
        dangerLevel: 5,
        roar: 'HHH-RRRR-AAAAAA!',
        funFact: 'Spinosaurus is the largest known carnivorous dinosaur, even larger than the T-Rex.',
        description: 'A massive sail-backed dinosaur that was likely semi-aquatic, specialized in catching large fish.',
        image: 'https://images.unsplash.com/photo-1620050861442-99933580c868?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Brachiosaurus',
        species: 'Brachiosaurus altithorax',
        diet: 'Herbivore',
        period: 'Late Jurassic',
        dangerLevel: 2,
        roar: 'HNNNN-HOOOOO!',
        funFact: 'Brachiosaurus had front legs that were longer than its hind legs, giving it a giraffe-like posture.',
        description: 'A massive sauropod with a long neck that allowed it to reach high foliage.',
        image: 'https://images.unsplash.com/photo-1525869916826-972885c91c1e?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Stegosaurus',
        species: 'Stegosaurus stenops',
        diet: 'Herbivore',
        period: 'Late Jurassic',
        dangerLevel: 2,
        roar: 'HNNNN-THUMP!',
        funFact: 'Known for the double row of bony plates along its back and its spiked tail.',
        description: 'Stegosaurus had a brain the size of a walnut despite its massive body.',
        image: 'https://images.unsplash.com/photo-1620050861214-49c71a396263?w=1200&auto=format&fit=crop'
      }
    ]
    await Dinosaur.insertMany(initialDinos)
    console.log('[api] Initial dinosaur data seeded.')
  }
}

// Routes
app.post('/api/admin/reset', async (req, res) => {
  try {
    await seedData(true)
    res.json({ message: 'Park records have been reset and updated with latest DNA data.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
app.get('/api/dinosaurs', async (req, res) => {
  try {
    const dinos = await Dinosaur.find()
    res.json(dinos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Database connection and server start
async function start() {
  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI)
      console.log('[api] Mongo connected')
      await seedData()
    } catch (err) {
      console.error('[api] Mongo connection error:', err)
      process.exit(1)
    }
  } else {
    console.error('[api] MONGO_URI is missing!')
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`[api] Jurassic API running on http://localhost:${PORT}`)
  })
}

start()
