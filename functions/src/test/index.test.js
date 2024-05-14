import * as func from '../index';
import * as admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const app = admin.initializeApp({
  projectId: 'scanlead-17f3a',
  credential: admin.credential.applicationDefault()
});

const db = app.firestore();
db.settings({
  host: 'localhost',
  port: 8080
});

// run emulator separately. Running jest should trigger the test functions here

test('Tests format of last updated', async () => {
  const collectionPath = 'testing/event1/eventbrite/';

  // First, set the last updated doc using the function `updatePullTime
  await func.updatePullTime(collectionPath);
});

