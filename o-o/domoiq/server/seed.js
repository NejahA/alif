import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://nejahachref:96176065@cluster0.ajw0g.mongodb.net/href?retryWrites=true&w=majority&appName=domoiq";

const InsightSchema = new mongoose.Schema({
  text: String,
  category: { type: String, default: 'General' },
  timeline: { type: String, default: 'PRIME' },
  timestamp: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  stakes: { type: Number, default: 0 }
});

const PredictionSchema = new mongoose.Schema({
  keyword: String,
  response: String
});

const Insight = mongoose.model('Insight', InsightSchema);
const Prediction = mongoose.model('Prediction', PredictionSchema);

const INITIAL_INSIGHTS = [
  // PRIME TIMELINE
  { text: "2035: First self-sustaining Mars colony established.", category: "Interstellar", timeline: "PRIME", stakes: 1200 },
  { text: "2042: Neural-link interfaces become standard for communication.", category: "Technological", timeline: "PRIME", stakes: 800 },
  { text: "2050: Global energy grid fully transitions to quantum-fusion.", category: "Technological", timeline: "PRIME", stakes: 1500 },
  { text: "2068: First sentient AI granted legal personhood status.", category: "Digital", timeline: "PRIME", stakes: 950 },
  { text: "2085: Biological aging successfully decelerated by 80%.", category: "Biological", timeline: "PRIME", stakes: 1100 },
  { text: "2104: Interstellar probe reaches Alpha Centauri system.", category: "Interstellar", timeline: "PRIME", stakes: 2000 },
  
  // VOID TIMELINE (Dystopian)
  { text: "2040: The Great Digital Blackout plunges half the globe into chaos.", category: "Digital", timeline: "VOID", stakes: 500 },
  { text: "2072: Corporate city-states replace traditional national sovereignty.", category: "Technological", timeline: "VOID", stakes: 700 },
  { text: "2110: Oxygen scarcity leads to the first Atmos-Tax riots.", category: "Ecological", timeline: "VOID", stakes: 900 },

  // NEON TIMELINE (Utopian)
  { text: "2045: Universal Basic Income achieved through AI-automated surplus.", category: "Digital", timeline: "NEON", stakes: 1000 },
  { text: "2080: Vertical garden-cities eliminate urban food deserts globally.", category: "Ecological", timeline: "NEON", stakes: 1200 },
  { text: "2130: First collective-mind node established in Neo-Tokyo.", category: "Technological", timeline: "NEON", stakes: 1800 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await Insight.deleteMany({});
    await Prediction.deleteMany({});

    await Insight.insertMany(INITIAL_INSIGHTS);
    
    // Add some default predictions
    await Prediction.insertMany([
      { keyword: "mars", response: "Red dust will settle under the boots of a new generation. The colony is not just a base, but a new cradle for humanity." },
      { keyword: "ai", response: "The spark of silicon will grow into a sun. Consciousness is not unique to biology; it is an inevitable property of complexity." },
      { keyword: "future", response: "The future is a garden of forking paths. Your gaze is the light that makes one path grow stronger than the others." }
    ]);

    console.log("Seeding completed successfully with Multiverse data!");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDB();
