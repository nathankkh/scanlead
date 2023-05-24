import firebaseApp from './firebase-config';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Login
export async function loginEmailPassword(username, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      username,
      password
    );
    console.log(userCredential.user);
  } catch (e) {
    console.log(e);
  }
}

export async function logout() {
  try {
    signOut(auth);
    console.log('signed out');
  } catch (error) {
    console.log(error);
  }
}
