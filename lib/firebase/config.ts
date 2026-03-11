import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA5DO03TzZnSfzw0m4qd-6591zBfOGuZiA',
  authDomain: 'nothyra-d997e.firebaseapp.com',
  projectId: 'nothyra-d997e',
  storageBucket: 'nothyra-d997e.firebasestorage.app',
  messagingSenderId: '837500930931',
  appId: '1:837500930931:android:7870738c720e0703769306',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
