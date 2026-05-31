import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function test() {
  if (!MONGO_URI) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }
  console.log('Connecting to', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    process.exit(0);
  } catch (e) {
    console.error('Connection failed', e);
    process.exit(1);
  }
}

test();
