import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const recipesPath = path.resolve(__dirname, '../data/recipes.json');

const firebaseConfig = {
  apiKey: 'AIzaSyA5DO03TzZnSfzw0m4qd-6591zBfOGuZiA',
  authDomain: 'nothyra-d997e.firebaseapp.com',
  projectId: 'nothyra-d997e',
  storageBucket: 'nothyra-d997e.firebasestorage.app',
  messagingSenderId: '837500930931',
  appId: '1:837500930931:android:7870738c720e0703769306',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const raw = await fs.readFile(recipesPath, 'utf8');
  const recipes = JSON.parse(raw);

  if (!Array.isArray(recipes)) {
    throw new Error('recipes.json debe ser un array');
  }

  for (const recipe of recipes) {
    await addDoc(collection(db, 'recipes'), {
      ...recipe,
      createdBy: 'seed-script',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  console.log(`Subidas ${recipes.length} recetas a Firestore`);
}

main().catch((error) => {
  console.error('Error subiendo recetas:', error);
  process.exit(1);
});
