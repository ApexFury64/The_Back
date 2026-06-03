const admin = require('firebase-admin');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
let serviceAccountJsonStr = envFile.split('FIREBASE_SERVICE_ACCOUNT_JSON=')[1];
if (serviceAccountJsonStr) {
  serviceAccountJsonStr = serviceAccountJsonStr.split('\n')[0].trim().replace(/^"|"$/g, '');
} else {
  console.error("Could not find FIREBASE_SERVICE_ACCOUNT_JSON in .env.local");
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountJsonStr);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const schoolId = 'dps-001';

async function clearCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function seedData() {
  console.log("Clearing old mock data...");
  await clearCollection('subjects');
  await clearCollection('quizzes');
  await clearCollection('assignments');
  await clearCollection('classes');
  
  console.log("Seeding multi-year mock data (Grades 6, 7, 8)...");

  // 1. School Data
  await db.collection('schools').doc(schoolId).set({
    name: 'Delhi Public School',
    createdAt: new Date().toISOString(),
    status: 'active'
  }, { merge: true });

  // 7. Subjects (Past and Current Years)
  const subjects = [
    // 6th Standard
    { name: 'Mathematics (6th Grade)', code: 'MATH-6', standard: '6', teacherId: 'teacher@dps.edu', color: '#0ea5e9' },
    { name: 'Science (6th Grade)', code: 'SCI-6', standard: '6', teacherId: 'teacher@dps.edu', color: '#00d4aa' },
    { name: 'History (6th Grade)', code: 'HIST-6', standard: '6', teacherId: 'teacher@dps.edu', color: '#a78bfa' },
    // 7th Standard
    { name: 'Mathematics (7th Grade)', code: 'MATH-7', standard: '7', teacherId: 'teacher@dps.edu', color: '#0ea5e9' },
    { name: 'Science (7th Grade)', code: 'SCI-7', standard: '7', teacherId: 'teacher@dps.edu', color: '#00d4aa' },
    { name: 'Geography (7th Grade)', code: 'GEO-7', standard: '7', teacherId: 'teacher@dps.edu', color: '#f59e0b' },
    // 8th Standard (Current)
    { name: 'Mathematics', code: 'MATH-8', standard: '8', teacherId: 'teacher@dps.edu', color: '#0ea5e9' },
    { name: 'Physics', code: 'PHY-8', standard: '8', teacherId: 'teacher@dps.edu', color: '#00d4aa' },
    { name: 'Chemistry', code: 'CHEM-8', standard: '8', teacherId: 'teacher@dps.edu', color: '#a78bfa' },
    { name: 'World History', code: 'WH-8', standard: '8', teacherId: 'teacher@dps.edu', color: '#f59e0b' },
    { name: 'English Literature', code: 'ENG-8', standard: '8', teacherId: 'teacher@dps.edu', color: '#f97066' }
  ];
  for (const s of subjects) {
    await db.collection('subjects').doc().set({ ...s, schoolId });
  }

  // 2. Assignments
  const assignments = [
    // 6th Grade
    { title: 'Fractions Basics', subject: 'Mathematics (6th Grade)', class: 'Class 6', dueDate: '2024-09-10T23:59:00Z', status: 'graded', teacherId: 'teacher@dps.edu' },
    { title: 'Plant Cells', subject: 'Science (6th Grade)', class: 'Class 6', dueDate: '2024-10-05T23:59:00Z', status: 'graded', teacherId: 'teacher@dps.edu' },
    // 7th Grade
    { title: 'Algebraic Expressions', subject: 'Mathematics (7th Grade)', class: 'Class 7', dueDate: '2025-08-15T23:59:00Z', status: 'graded', teacherId: 'teacher@dps.edu' },
    { title: 'Earth Structure', subject: 'Geography (7th Grade)', class: 'Class 7', dueDate: '2025-11-20T23:59:00Z', status: 'graded', teacherId: 'teacher@dps.edu' },
    // 8th Grade (Current)
    { title: 'Linear Equations in One Variable', subject: 'Mathematics', class: 'Class 8-A', dueDate: '2026-06-10T23:59:00Z', status: 'active', teacherId: 'teacher@dps.edu' },
    { title: 'Force and Pressure', subject: 'Physics', class: 'Class 8-A', dueDate: '2026-06-12T23:59:00Z', status: 'active', teacherId: 'teacher@dps.edu' },
    { title: 'Synthetic Fibres and Plastics', subject: 'Chemistry', class: 'Class 8-A', dueDate: '2026-06-15T23:59:00Z', status: 'active', teacherId: 'teacher@dps.edu' },
    { title: 'The French Revolution', subject: 'World History', class: 'Class 8-A', dueDate: '2026-06-18T23:59:00Z', status: 'active', teacherId: 'teacher@dps.edu' }
  ];
  for (const a of assignments) {
    await db.collection('assignments').doc().set({ ...a, schoolId, createdAt: new Date().toISOString() });
  }

  // 5. Quizzes
  const quizzes = [
    // 6th
    { title: 'Fractions Test', subject: 'Mathematics (6th Grade)', class: 'Class 6', questions: 10, timeLimit: 30, status: 'published', teacherId: 'teacher@dps.edu', due: 'Past' },
    // 7th
    { title: 'Algebra Midterm', subject: 'Mathematics (7th Grade)', class: 'Class 7', questions: 20, timeLimit: 45, status: 'published', teacherId: 'teacher@dps.edu', due: 'Past' },
    // 8th
    { title: 'Physics Chapter 1 Quiz', subject: 'Physics', class: 'Class 8-A', questions: 15, timeLimit: 20, status: 'published', teacherId: 'teacher@dps.edu', due: 'Next Week', difficulty: 'Medium' },
    { title: 'Math Weekly Test', subject: 'Mathematics', class: 'Class 8-A', questions: 10, timeLimit: 30, status: 'published', teacherId: 'teacher@dps.edu', due: 'Tomorrow', difficulty: 'Hard' }
  ];
  for (const q of quizzes) {
    await db.collection('quizzes').doc().set({ ...q, schoolId, createdAt: new Date().toISOString() });
  }

  // 8. Classes (Sections)
  const classesData = [
    { name: 'Class 8-A', grade: '8', teacherId: 'teacher@dps.edu' },
    { name: 'Class 8-B', grade: '8', teacherId: 'teacher@dps.edu' }
  ];
  for (const c of classesData) {
    await db.collection('classes').doc().set({ ...c, schoolId });
  }

  console.log("Mock data seeding completed successfully!");
  process.exit(0);
}

seedData().catch(console.error);
