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
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  getDocs,
  setDoc,
  doc
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

export function getCurrentUserEmail() {
  console.log(auth.currentUser.email);
  return auth.currentUser.email;
}

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
 * @param {String} collectionName Name of the collection in Firestore to add the file's URL reference to.
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
    const filePath = `${auth.currentUser.email}/${fileRef.id}`; // TODO: Pull name from scanned QR code. //FIXME: ADD TO CONFIG
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
    console.log('Error: ' + error);
    await deleteDoc(fileRef);
    alert('error uploading file, try again');
    console.log(error);
  }
}

/**
 * Uploads a document to a given collection in Firestore, based on the docName provided.
 * The lead argument should be an Object with Key-Value pairs.
 * @param {Object} lead An Object with Key-Value pairs.
 * @param {String} docName The name of the document. Recommended to concat userEmail_qrResult
 * @param {String} collectionName The name of the collection in Firestore to upload the document to.
 */
export async function submitLead(
  lead,
  docName,
  collectionName = auth.currentUser.email
) {
  const collectionRef = collection(db, collectionName);
  try {
    await setDoc(doc(collectionRef, docName), lead, { merge: true });
    console.log('Document written at: ', Date.now());
  } catch (error) {
    alert('error setting doc: ' + error);
    console.log(error);
  }
}

/**
 * Retrieves a document from a given collection in Firestore, based on the lookup value provided.
 * @param {*} lookupValue  The value to search for. (e.g. QR code's result)
 * @param {String} collectionName The name of the collection in Firestore to search in.
 * @param {String} referenceField  The field in the collection to find lookupString. (e.g. uid, email)
 * @returns A promise of an array of documents that match the lookupString.
 */
export async function lookupValue(lookupValue, collectionName, referenceField) {
  // used to get attendee's data from a successful QR scan
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where(referenceField, '==', lookupValue));
  const querySnapshot = await getDocs(q);
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push(doc.data());
  });
  return results;
}

/**
 * Gets all documents from a given collection in Firestore.
 * @param {*} collectionName The name of the collection to retrieve. Pass in current user's email.
 * @returns A promise of an array of documents from the collection.
 */
export async function getAllLeads(collectionName) {
  const collectionRef = collection(db, collectionName);
  const querySnapshot = await getDocs(collectionRef);
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push(doc.data());
  });
  return results;
}
