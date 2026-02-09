import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, Database, get } from 'firebase/database';

let app: FirebaseApp | null = null;
let db: Database | null = null;

export const initFirebase = (config: any) => {
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp(); // Use existing app if already initialized
    }
    db = getDatabase(app);
    return true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return false;
  }
};

export const getFirebaseDb = () => db;

// Data operations
export const saveToCloud = async (path: string, data: any) => {
  if (!db) return;
  try {
    await set(ref(db, path), data);
  } catch (e) {
    console.error("Save to cloud failed", e);
  }
};

export const subscribeToCloud = (path: string, callback: (data: any) => void) => {
  if (!db) return () => {};
  const dataRef = ref(db, path);
  const unsubscribe = onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
  return unsubscribe;
};
