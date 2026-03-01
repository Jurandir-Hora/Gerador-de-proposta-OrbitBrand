import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBAERpKE08w7hdfyztvr94JPuuvBAK3Jwc',
  authDomain: 'atomos-1116f.firebaseapp.com',
  projectId: 'atomos-1116f',
  storageBucket: 'atomos-1116f.firebasestorage.app',
  messagingSenderId: '705609930596',
  appId: '1:705609930596:web:d067717bccef3788530c71',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
