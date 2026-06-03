const admin = require('firebase-admin');
const fs = require('fs');

try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  let serviceAccountJsonStr = envFile.split('FIREBASE_SERVICE_ACCOUNT_JSON=')[1];
  
  if (serviceAccountJsonStr.startsWith("'")) {
    serviceAccountJsonStr = serviceAccountJsonStr.substring(1);
  }
  
  // Find the last quote
  const lastQuoteIndex = serviceAccountJsonStr.lastIndexOf("'");
  if (lastQuoteIndex > 0) {
    serviceAccountJsonStr = serviceAccountJsonStr.substring(0, lastQuoteIndex);
  }

  const serviceAccount = JSON.parse(serviceAccountJsonStr);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  async function testConnection() {
    console.log("Testing Firestore Connection...");
    const ref = db.collection('test').doc('test-doc');
    await ref.set({ success: true, timestamp: new Date().toISOString() });
    console.log("Write successful!");
    
    const doc = await ref.get();
    console.log("Read successful! Data:", doc.data());
    
    await ref.delete();
    console.log("Delete successful!");
    console.log("FIREBASE CONNECTION IS PERFECT!");
    process.exit(0);
  }

  testConnection().catch(e => {
    console.error("Firebase connection failed:", e.message);
    process.exit(1);
  });
} catch (error) {
  console.error("Failed to parse credentials or initialize:", error.message);
  process.exit(1);
}
