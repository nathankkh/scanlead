import firebaseApp from './firebase-config';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
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
  doc,
  onSnapshot,
  orderBy,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
const eventID = '741341922647';

export function getCurrentUserEmail() {
  if (auth.currentUser.email) {
    return auth.currentUser.email;
  } else {
    throw new Error('No email found');
  }
}

export function getCurrentUser() {
  if (auth.currentUser.email) {
    return auth.currentUser.email.split('@')[0];
  } else {
    throw new Error('No email found');
  }
}

function isUserSignedIn() {
  return !!auth.currentUser;
}

const firebaseErrors = {
  'auth/invalid-email': 'Invalid username',
  'auth/user-disabled': 'User disabled',
  'auth/user-not-found': 'Invalid username',
  'auth/wrong-password': 'Incorrect password',
  'auth/too-many-requests': 'Too many login attempts. Please wait or approach the team for help.'
};

// Login
export async function loginEmailPassword(username, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    console.log(userCredential.user);
  } catch (e) {
    console.log(e);
    const errorCode = e.code;
    const errorMessage = firebaseErrors[errorCode] || e.code;
    console.error('Error logging in:', errorMessage);
    throw new Error(errorMessage);
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
 * @deprecated
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
 * @deprecated due to new folder structure
 */
export async function submitLeadbk(lead, docName, collectionName = auth.currentUser.email) {
  const collectionRef = collection(db, collectionName); // TODO: UPDATE to match new folder structure
  try {
    await setDoc(doc(collectionRef, docName), lead, { merge: true });
    console.log('Document written at: ', Date.now());
  } catch (error) {
    alert('error setting doc: ' + error);
    console.log(error);
  }
}

export async function submitLead(lead, docName, username = auth.currentUser.email) {
  // check for existence of doc. if exists, carry on.
  // if not, create doc with default values
  updateEventsParticipated();
  const collectionRef = collection(db, 'users', username, eventID);
  try {
    await setDoc(doc(collectionRef, docName), lead, { merge: true });
    console.log('SubmitLead: Document written at: ', Date.now());
  } catch (error) {
    alert('SubmitLead: error setting doc: ' + error);
    console.log(error);
  }
}

/**
 * Updates the array of events particpated in for a given user.
 * @param {String} username
 */
async function updateEventsParticipated(username = auth.currentUser.email) {
  const collectionRef = collection(db, 'users');
  try {
    await setDoc(doc(collectionRef, username), {
      eventsParticipated: arrayUnion(eventID)
    }),
      { merge: true };
    console.log('updateEventsParticipated: updated array at ', Date.now());
  } catch (error) {
    alert('updateEventsParticipated error: ' + error);
    console.log(error);
  }
}

/**
 * Retrieves a document from a given collection in Firestore, based on the lookup value provided.
 * @param {*} lookupValue  The value to search for. (e.g. QR code's result)
 * @param {String} collectionName The name of the collection in Firestore to search in.
 * @param {String} referenceField  The field in the collection to find lookupString. (e.g. uid, email)
 * @returns A promise of an array of documents that match the lookupString. (Should only be one)
 * @deprecated due to new folder structure
 */
export async function lookupValuebk(lookupValue, collectionName, referenceField) {
  // used to get attendee's data from a successful QR scan
  const collectionRef = collection(db, collectionName); // TODO: UPDATE to match new folder structure
  const q = query(collectionRef, where(referenceField, '==', lookupValue));
  const querySnapshot = await getDocs(q);
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push(doc.data());
  });
  return results;
}

/**
 * Retrieves a document from a given collection in Firestore, based on the lookup value provided.
 * Called when participant QR code is scanned.
 * @param {*} lookupValue The value to search for. (e.g. QR code's result)
 * @param {String} path A string representation of the path to the specific collection in Firestore to search in. (e.g. 'users/username/eventID')
 * @param {String} referenceField The field in the collection to find lookupString. (e.g. uid, email)
 * @returns A promise of an array of documents that match the lookupString. (Should only be one)
 */
export async function lookupValue(lookupValue, path, referenceField) {
  // used to get attendee's data from a successful QR scan
  const collectionRef = collection(db, path);
  const q = query(collectionRef, where(referenceField, '==', lookupValue));
  const querySnapshot = await getDocs(q);
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push(doc.data());
  });
  console.log('Function `lookupValue` result: ', results);
  return results;
}

/**
 * Gets all documents from a given collection in Firestore.
 * @param {*} collectionName The name of the collection to retrieve.
 * @returns A promise of an array of documents from the collection.
 */
export async function getAllDocs(collectionName) {
  //FIXME: Unused, can delete
  const collectionRef = collection(db, collectionName);
  const querySnapshot = await getDocs(collectionRef);
  const results = [];
  querySnapshot.forEach((doc) => {
    let currentDoc = doc.data();
    currentDoc.id = doc.id; // appends doc's ID to the object for future reference
    results.push(currentDoc);
  });
  return results;
}

/**
 * Creates a listener for a given collection in Firestore.
 * @param {String} path A string representation of the path to the specific collection in Firestore to listen to. (e.g. 'users/username/eventID')
 * @param {*} snapshotCallback A callback function to be called when a snapshot is received. Use in conjunction with a way to display a data snapshot.
 * @param {*} errorCallback A callback function to be called when an error occurs.
 * @returns an unsubscribe function
 */
export function subscribeToCollection(path, snapshotCallback, errorCallback) {
  const collectionRef = collection(db, path);
  const q = query(collectionRef, orderBy('timestamp', 'desc'));
  return onSnapshot(q, snapshotCallback, errorCallback);
}

export async function deleteLead(path, docName) {
  const collectionRef = collection(db, path);
  try {
    await deleteDoc(doc(collectionRef, docName));
  } catch (err) {
    console.log(err);
    alert('Error deleting lead! Please inform tech desk.');
  }
}

/**
 * Uploads an array of documents to a given collection in Firestore as one or more batchWrites.
 * @param {string} collectionName The name of the collection in Firestore to upload the documents to.
 * @param {Array} dataArray An array of documents to upload. Each document should be an object with data stored as key-value pairs.
 * @param {number} lastUpdateTime Milliseconds since epoch. Used to update the lastUpdated doc.
 * @param {number} batchSize The number of operations per batch. Default is 500.
 * @deprecated as this is handled by cloud functions now
 */
export async function uploadBatch(collectionName, dataArray, lastUpdateTime, batchSize = 500) {
  batchSize = batchSize - 1; // -1 to account for lastUpdated doc
  console.log('awaiting batch');
  console.log(dataArray);
  const lastUpdateRef = doc(db, collectionName, 'lastUpdated'); // TODO: UPDATE to match new folder structure
  const collectionRef = collection(db, collectionName);
  const numBatches = Math.ceil(dataArray.length / batchSize);

  for (let i = 0; i < numBatches; i++) {
    try {
      const batch = writeBatch(db);
      const startIndex = i * batchSize;
      const endIndex = startIndex + batchSize;
      const batchArray = dataArray.slice(startIndex, endIndex);

      batchArray.forEach((obj) => {
        const docRef = doc(collectionRef /* , obj.EBid */);
        batch.set(docRef, { ...obj });
      });
      batch.set(lastUpdateRef, { timestamp: lastUpdateTime, dateTime: new Date(lastUpdateTime) });
      batch.commit();
      console.log('batched');
    } catch (err) {
      console.log(err);
    }
  }
}
