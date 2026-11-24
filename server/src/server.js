import app from './app.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Student } from './models/Student.js';
import { Attendance } from './models/Attendance.js';
import { AcademicRecord } from './models/AcademicRecord.js';
import { Intervention } from './models/Intervention.js';
import { LearningResource } from './models/LearningResource.js';
import {
  getSeedUsers,
  seedStudents,
  getSeedAttendance,
  seedAcademicRecords,
  seedInterventions,
  seedLearningResources
} from './seed/seedData.js';

const PORT = process.env.PORT || 5000;

export const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AutoSeed] Empty database detected. Populating demo personas & datasets...');
      const usersData = await getSeedUsers();
      await User.insertMany(usersData);
      await Student.insertMany(seedStudents);
      await Attendance.insertMany(getSeedAttendance());
      await AcademicRecord.insertMany(seedAcademicRecords);
      await Intervention.insertMany(seedInterventions);
      await LearningResource.insertMany(seedLearningResources);
      console.log('[AutoSeed] Successfully auto-seeded demo dataset into database!');
    } else {
      console.log(`[AutoSeed] Database already populated (${userCount} users present).`);
    }
  } catch (err) {
    console.warn('[AutoSeed] Auto-seed check notice:', err.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();
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
