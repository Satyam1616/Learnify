import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (getApps().length === 0) {
    // For development, you can use a service account key file
    // For production, use environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      // For development with service account file
      // Place your firebase-service-account.json in the server directory
      try {
        const serviceAccount = require('./firebase-service-account.json');
        initializeApp({
          credential: cert(serviceAccount)
        });
      } catch (error) {
        // Fallback for development without service account
        console.warn('Firebase service account not found. Using default initialization.');
        initializeApp();
      }
    }
  }
  return getFirestore();
};

export const db = initializeFirebase();

// Collection names
export const COLLECTIONS = {
  CONTACTS: 'contact_submissions',
  NEWSLETTER: 'newsletter_subscriptions', 
  ENROLLMENTS: 'course_enrollments',
  USERS: 'users'
} as const;