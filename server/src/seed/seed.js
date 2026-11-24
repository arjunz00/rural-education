import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { Intervention } from '../models/Intervention.js';
import { LearningResource } from '../models/LearningResource.js';
import { Quiz } from '../models/Quiz.js';
import { QuizSubmission } from '../models/QuizSubmission.js';
import {
  getSeedUsers,
  seedStudents,
  getSeedAttendance,
  seedAcademicRecords,
  seedInterventions,
  seedLearningResources,
  seedQuizzes
} from './seedData.js';

const runSeed = async () => {
  console.log('\n======================================================');
  console.log('🌾 Rural Education Remote Monitoring - Database Seeder');
  console.log('======================================================\n');

  try {
    await connectDB();

    console.log('[1/8] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Attendance.deleteMany({}),
      AcademicRecord.deleteMany({}),
      Intervention.deleteMany({}),
      LearningResource.deleteMany({}),
      Quiz.deleteMany({}),
      QuizSubmission.deleteMany({})
    ]);
    console.log('  ✓ Cleaned collections successfully.');

    console.log('[2/7] Seeding Students...');
    const students = await Student.insertMany(seedStudents);
    console.log(`  ✓ Created ${students.length} students (Asha Jadhav #1, Rohan Pawar #2, Meena Shinde #3, etc.)`);

    console.log('[3/7] Seeding Users with Hashed Credentials...');
    const usersData = await getSeedUsers();
    const users = await User.insertMany(usersData);
    console.log(`  ✓ Created ${users.length} persona accounts:`);
    console.table(
      users.map(u => ({
        Username: u.username,
        Role: u.role,
        FullName: u.fullName,
        LinkedStudentId: u.studentId || 'N/A'
      }))
    );

    console.log('[4/7] Seeding 10-Day Realistic Attendance Matrix...');
    const attendanceRecords = getSeedAttendance();
    const insertedAttendance = await Attendance.insertMany(attendanceRecords);
    console.log(`  ✓ Created ${insertedAttendance.length} attendance records across 5 students.`);

    console.log('[5/7] Seeding Academic CCE Marks Records...');
    const academic = await AcademicRecord.insertMany(seedAcademicRecords);
    console.log(`  ✓ Created ${academic.length} Unit Test 1 subject marks.`);

    console.log('[6/7] Seeding Proactive Teacher Interventions...');
    const interventions = await Intervention.insertMany(seedInterventions);
    console.log(`  ✓ Created ${interventions.length} teacher intervention logs.`);

    console.log('[7/8] Seeding Low-Bandwidth Offline Learning Resources...');
    const resources = await LearningResource.insertMany(seedLearningResources);
    console.log(`  ✓ Created ${resources.length} learning resources (audio + text).`);

    console.log('[8/8] Seeding Remedial Practice Quizzes & Diagnostic Tests...');
    const quizzes = await Quiz.insertMany(seedQuizzes);
    console.log(`  ✓ Created ${quizzes.length} remedial practice quizzes.`);

    console.log('\n======================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('Default Password for all seeded accounts: "password123"');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

runSeed();
