import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Politician from '@/models/Politician';
import LeadershipCampaign from '@/models/LeadershipCampaign';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGO_URI || '';

if (!MONGODB_URI) {
  console.error('Please define MONGO_URI in .env.local');
  process.exit(1);
}

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
    lastPublicAppearance: new Date(Date.now() - 3600000), // 1 hour ago
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
    lastPublicAppearance: new Date(Date.now() - 86400000), // 1 day ago
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