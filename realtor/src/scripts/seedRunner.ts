import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db';
import { seedUsers } from '../seed';

dotenv.config();

async function run() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB.');
    await seedUsers();
    console.log('🌱 Database seeded successfully.');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
}

run();
