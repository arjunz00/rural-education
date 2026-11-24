import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { autoSeedIfEmpty } from '../server/src/server.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      await autoSeedIfEmpty();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] MongoDB connection error:', err.message);
    }
  }
  return app(req, res);
}
