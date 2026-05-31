const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGO_URI || '';

if (!MONGODB_URI) {
  console.error('Please define MONGO_URI in .env.local');
  process.exit(1);
}

const PoliticianSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  party: { type: String, required: true },
  location: { type: String, required: true },
  approvalRating: { type: Number, required: true, min: 0, max: 100, default: 50 },
  status: { type: String, enum: ['active', 'retired', 'investigation'], default: 'active' },
  ideology: { type: String, enum: ['progressive', 'moderate', 'conservative', 'liberal', 'nationalist'], default: 'moderate' },
  lastPublicAppearance: { type: Date, default: null },
  yearsInOffice: { type: Number, required: true, min: 0 },
  keyPolicies: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LeadershipCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  campaignType: { type: String, enum: ['election', 'policy_initiative', 'reform', 'grassroots', 'legislative'], default: 'election' },
  region: { type: String, required: true },
  politicians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Politician' }],
  publicSupport: { type: Number, default: 0, min: 0, max: 100 },
  targetSupport: { type: Number, default: 50, min: 0, max: 100 },
  keyIssues: [{ type: String }],
  status: { type: String, enum: ['planning', 'active', 'completed', 'stalled'], default: 'planning' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Politician = mongoose.models.Politician || mongoose.model('Politician', PoliticianSchema);
const LeadershipCampaign = mongoose.models.LeadershipCampaign || mongoose.model('LeadershipCampaign', LeadershipCampaignSchema);

const samplePoliticians = [
  {
    name: 'Alexandra Chen',
    position: 'Senator',
    party: 'Progressive Alliance',
    location: 'California',
    approvalRating: 68,
    status: 'active',
    ideology: 'progressive',
    lastPublicAppearance: new Date(),
    yearsInOffice: 8,
    keyPolicies: ['Climate Action', 'Healthcare Reform', 'Education Funding'],
  },
  {
    name: 'Marcus Johnson',
    position: 'Governor',
    party: 'Conservative Coalition',
    location: 'Texas',
    approvalRating: 55,
    status: 'active',
    ideology: 'conservative',
    lastPublicAppearance: new Date(Date.now() - 3600000),
    yearsInOffice: 4,
    keyPolicies: ['Tax Reduction', 'Border Security', 'Business Incentives'],
  },
  {
    name: 'Sarah Williams',
    position: 'Mayor',
    party: 'Moderate Party',
    location: 'New York',
    approvalRating: 72,
    status: 'active',
    ideology: 'moderate',
    lastPublicAppearance: new Date(Date.now() - 86400000),
    yearsInOffice: 6,
    keyPolicies: ['Infrastructure', 'Public Safety', 'Economic Development'],
  },
  {
    name: 'Robert Garcia',
    position: 'Former President',
    party: 'Liberal Democrats',
    location: 'Washington D.C.',
    approvalRating: 45,
    status: 'retired',
    ideology: 'liberal',
    lastPublicAppearance: null,
    yearsInOffice: 20,
    keyPolicies: ['Civil Rights', 'Foreign Policy', 'Social Programs'],
  },
  {
    name: 'Elena Rodriguez',
    position: 'Congresswoman',
    party: 'Nationalist Front',
    location: 'Florida',
    approvalRating: 60,
    status: 'investigation',
    ideology: 'nationalist',
    lastPublicAppearance: new Date(),
    yearsInOffice: 2,
    keyPolicies: ['Immigration Control', 'Trade Protection', 'Military Funding'],
  },
];

const sampleCampaigns = [
  {
    name: '2024 Presidential Election',
    description: 'National presidential campaign focusing on economic recovery',
    campaignType: 'election',
    region: 'National',
    publicSupport: 65,
    targetSupport: 50,
    keyIssues: ['Economy', 'Healthcare', 'Education', 'Climate'],
    status: 'active',
  },
  {
    name: 'Green Energy Initiative',
    description: 'Policy campaign for renewable energy transition',
    campaignType: 'policy_initiative',
    region: 'National',
    publicSupport: 42,
    targetSupport: 60,
    keyIssues: ['Renewable Energy', 'Job Creation', 'Environmental Protection'],
    status: 'planning',
  },
  {
    name: 'Criminal Justice Reform',
    description: 'Grassroots campaign for justice system overhaul',
    campaignType: 'reform',
    region: 'Multiple States',
    publicSupport: 58,
    targetSupport: 40,
    keyIssues: ['Sentencing Reform', 'Police Accountability', 'Rehabilitation'],
    status: 'active',
  },
  {
    name: 'Local Community Development',
    description: 'Grassroots campaign for urban renewal',
    campaignType: 'grassroots',
    region: 'Urban Centers',
    publicSupport: 75,
    targetSupport: 70,
    keyIssues: ['Affordable Housing', 'Public Transportation', 'Small Business Support'],
    status: 'completed',
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Politician.deleteMany({});
    await LeadershipCampaign.deleteMany({});
    console.log('Cleared existing data');

    // Insert politicians
    const createdPoliticians = await Politician.insertMany(samplePoliticians);
    console.log(`Inserted ${createdPoliticians.length} politicians`);

    // Insert campaigns with politician references
    const campaignsWithPoliticians = sampleCampaigns.map((campaign, index) => ({
      ...campaign,
      politicians: [createdPoliticians[index % createdPoliticians.length]._id],
    }));

    const createdCampaigns = await LeadershipCampaign.insertMany(campaignsWithPoliticians);
    console.log(`Inserted ${createdCampaigns.length} campaigns`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();