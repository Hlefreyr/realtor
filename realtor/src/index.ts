import dotenv from 'dotenv';
import { createServer } from './server';
import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // Attempt database connection (with non-blocking warn if mongo is not yet running locally)
    try {
      await connectDB();
      console.log('✅ Connected to MongoDB successfully.');
    } catch (dbErr) {
      console.warn('⚠️ MongoDB connection deferred / unavailable:', (dbErr as Error).message);
    }

    const { app } = await createServer();

    app.listen(PORT, () => {
      console.log(`🚀 Realtor GraphQL Server ready at http://localhost:${PORT}/graphql`);
      console.log(`🩺 Health check ready at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
