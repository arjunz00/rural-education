import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Rural Education API] Server running on http://localhost:${PORT}`);
      console.log(`[Rural Education API] Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error(`[Server Error] Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
