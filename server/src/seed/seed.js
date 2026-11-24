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

    console.log('[2/8] Seeding Multi-Class Student Cohorts (Class 1 to 10)...');
    const students = await Student.insertMany(seedStudents);
    console.log(`  ✓ Created ${students.length} students across Classes 1-10.`);

    console.log('[3/8] Seeding Staff & Unique 1-to-1 Parent & Student Accounts...');
    const usersData = await getSeedUsers();
    const users = await User.insertMany(usersData);
    console.log(`  ✓ Created ${users.length} total user accounts (Staff, Parents, Students).`);

    console.log('[4/8] Seeding Historical Attendance Matrix (18 Official School Days)...');
    const attendanceRecords = getSeedAttendance();
    const insertedAttendance = await Attendance.insertMany(attendanceRecords);
    console.log(`  ✓ Created ${insertedAttendance.length} attendance records across all students.`);

    console.log('[5/8] Seeding CCE Academic Exam Marks Records...');
    const academic = await AcademicRecord.insertMany(seedAcademicRecords);
    console.log(`  ✓ Created ${academic.length} subject marks across Classes 1 to 10.`);

    console.log('[6/8] Seeding Documented Teacher Interventions & Home Outreach Logs...');
    const interventions = await Intervention.insertMany(seedInterventions);
    console.log(`  ✓ Created ${interventions.length} teacher intervention logs.`);

    console.log('[7/8] Seeding Class-Isolated Curriculum Learning Resources (Class 1 to 10)...');
    const resources = await LearningResource.insertMany(seedLearningResources);
    console.log(`  ✓ Created ${resources.length} curriculum-standard learning resources (audio + text).`);

    console.log('[8/8] Seeding Targeted Remedial Practice Quizzes & Diagnostic Tests...');
    const quizzes = await Quiz.insertMany(seedQuizzes);
    console.log(`  ✓ Created ${quizzes.length} remedial practice quizzes.`);

    console.log('\n======================================================');
    console.log('✅ Database Seeding Complete!');
    console.log(`   - Total Students: ${students.length} across Classes 1-10`);
    console.log(`   - Total Users (Staff + Parents + Students): ${users.length}`);
    console.log(`   - Total Attendance Days Logged: ${insertedAttendance.length}`);
    console.log(`   - Total CCE Academic Records: ${academic.length}`);
    console.log(`   - Total Teacher Interventions: ${interventions.length}`);
    console.log(`   - Total Class 1-10 Learning Resources: ${resources.length}`);
    console.log(`   - Total Remedial Quizzes: ${quizzes.length}`);
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
