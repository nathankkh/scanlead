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
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

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

/**
 * Uploads a file to Google Cloud and adds the file's URL reference to a given collection in Firestore.
 * Google Cloud location given by firebase-config.
 * @param {*} file
 * @param {*} collectionName Name of the collection in Firestore to add the file's URL reference to.
 */
export async function uploadFile(file, collectionName) {
  // Store a copy of the file in Cloud storage and a url reference to it in Firestore
  try {
    // Add dummy url reference to firestore
    const fileRef = await addDoc(collection(db, collectionName), {
      user: auth.currentUser.email,
      createdAt: serverTimestamp(),
      fileUrl: null
    });
    console.log('Document written at: ', Date.now());

    // Upload file to cloud storage
    const filePath = `${auth.currentUser.email}/${fileRef.id}`; // TODO: Pull name from scanned QR code
    const newFileRef = ref(storage, filePath);
    const fileSnapshot = await uploadBytesResumable(newFileRef, file);

    // create url
    const fileUrl = await getDownloadURL(newFileRef);

    // update dummy url reference
    await updateDoc(fileRef, {
      fileUrl: fileUrl,
      storageUri: fileSnapshot.metadata.fullPath
    });
    console.log('uploaded');
  } catch (error) {
    await deleteDoc(fileRef);
    alert('error uploading file, try again');
    console.log(error);
  }
}
