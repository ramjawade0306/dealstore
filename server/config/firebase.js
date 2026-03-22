const admin = require('firebase-admin');
require('dotenv').config();

let firebaseInitialized = false;

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID === 'your_firebase_project_id' ||
      !privateKey ||
      privateKey === 'your_firebase_private_key'
    ) {
      console.warn('⚠️  Firebase credentials not configured. Phone auth will be unavailable until you add real Firebase keys to server/.env');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized');
    }
  } else {
    firebaseInitialized = true;
  }
} catch (err) {
  console.warn('⚠️  Firebase initialization failed:', err.message);
}

module.exports = { admin, firebaseInitialized };
