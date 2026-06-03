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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const usersToCreate = [
  {
    email: 'super@techwing.com',
    password: 'demo123',
    name: 'TechWing Super Admin',
    role: 'super-admin',
    schoolId: 'system'
  },
  {
    email: 'admin@dps-hyd.edu',
    password: 'demo123',
    name: 'DPS Admin',
    role: 'admin',
    schoolId: 'dps-001'
  },
  {
    email: 'teacher@dps.edu',
    password: 'demo123',
    name: 'Jane Teacher',
    role: 'teacher',
    schoolId: 'dps-001'
  },
  {
    email: 'student@dps.edu',
    password: 'demo123',
    name: 'John Student',
    role: 'student',
    schoolId: 'dps-001'
  },
  {
    email: 'parent@dps.edu',
    password: 'demo123',
    name: 'Mary Parent',
    role: 'parent',
    schoolId: 'dps-001'
  }
];

async function seed() {
  console.log("Seeding initial users to Firebase...");
  for (const u of usersToCreate) {
    try {
      let userRecord;
      try {
         userRecord = await auth.getUserByEmail(u.email);
         console.log(`User ${u.email} already exists in Auth. Updating password.`);
         await auth.updateUser(userRecord.uid, { password: u.password });
      } catch (e) {
         if (e.code === 'auth/user-not-found') {
            userRecord = await auth.createUser({
              email: u.email,
              password: u.password,
              displayName: u.name,
            });
            console.log(`Created user ${u.email} in Auth.`);
         } else {
            throw e;
         }
      }

      await db.collection('users').doc(userRecord.uid).set({
        email: u.email,
        name: u.name,
        role: u.role,
        schoolId: u.schoolId,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      console.log(`Added/Updated ${u.email} in Firestore.`);
    } catch (e) {
      console.error(`Error processing ${u.email}:`, e.message);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
