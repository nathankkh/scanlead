/* eslint @typescript-eslint/no-var-requires: "off" */
// See a full list of supported triggers at https://firebase.google.com/docs/functions

const logger = require('firebase-functions/logger');
const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fetch = require('node-fetch');

const app = initializeApp();
const db = getFirestore(app);

const leadFields = {
  id: '',
  name: '',
  email: '',
  phone: '',
  jobTitle: '',
  experience: '',
  fieldOfInterest: '',
  leadType: '', // [hot, warm, cold]
  comments: ''
  // timestamp: undefined
};
const eventID = '627917607467';
const uploadCollection = 'upload';

/**
 * Retrieves key from google secret manager
 * @return {string} Secret value from Google Secret Manager
 */
async function getSecretValue() {
  const client = new SecretManagerServiceClient();
  const name = 'projects/292470144917/secrets/EB_key/versions/latest';

  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

/**
 * Retrieves ALL attendees from eventbrite
 * @param {number} pageNumber Page number of returned data to pull. 1 by default.
 * @return {json} JSON of returned data from eventbrite. Contains 2 parent keys: pagination and attendees
 */
async function getData(pageNumber = 1) {
  const key = await getSecretValue();
  try {
    const response = await fetch(
      'https://www.eventbriteapi.com/v3/events/' +
        `${eventID}` +
        '/attendees/?page=' +
        `${pageNumber}`,
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + key
        }
      }
    );
    const data = await response.json();
    logger.info(data.pagination);
    return data;
  } catch (error) {
    logger.error(error);
  }
}

/**
 * Takes in an attendee object from an Eventbrite API pull and populates the template `leadfields`.
 * @param {*} attendee An attendee's data from an Eventbrite API pull.
 * @return {json} JSON of attendee data.
 */
function populateAttendeeTemplate(attendee) {
  const template = { ...leadFields };
  template.id = attendee.order_id + attendee.id + '001';
  template.name = attendee.profile.name;
  template.email = attendee.profile.email;
  template.phone = attendee.profile.cell_phone;
  // template.jobTitle = obj.profile.job_title;
  // FIXME: Modify based on actual form
  /* template.experience = obj.answers[0].answer; // can match question_id too 
  template.fieldOfInterest = obj.answers[1].answer; */
  return template;
}

/**
 * Retrieves all new attendees from eventbrite.
 * Calls `getData()` to retrieve all attendees from eventbrite.
 * Calls firestore to see if there is a lastUpdated doc. If so, filters out attendees who were added to the collection after the last update time.
 * Uploads all new attendees to firestore.
 * @param {string} collectionName Name of collection to upload to.
 * @return {json} JSON of new attendees
 */
async function getNewAttendees(collectionName) {
  try {
    const lastUpdateRef = db.collection(`${collectionName}`).doc('lastUpdated');
    const lastUpdateDoc = await lastUpdateRef.get();
    const result = [];
    let pageNumber = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const data = await getData(pageNumber);
      const filteredAttendees = data.attendees.filter((attendee) => {
        if (lastUpdateDoc.exists) {
          // filters only attendees who registered after last update time
          return new Date(attendee.created).getTime() > lastUpdateDoc.data().timestamp;
        } else {
          return true; // all attendees in this page are new
        }
      });

      for (const attendee of filteredAttendees) {
        if (attendee.cancelled) {
          continue;
        }
        const template = populateAttendeeTemplate(attendee);
        result.push(template);
      }
      pageNumber++;
      hasNextPage = data.pagination.has_more_items;
    }
    logger.info(result);
    return result;
  } catch (error) {
    logger.error(error);
  }
}

/**
 * Uploads an array of documents to a given collection in Firestore as one or more batchWrites.
 * @param {string} collectionName The name of the collection in Firestore to upload the documents to.
 * @param {Array} dataArray An array of documents to upload. Each document should be an object with data stored as key-value pairs.
 * @param {number} batchSize The number of operations per batch. Default is 500.
 */
async function uploadBatch(collectionName, dataArray, batchSize = 500) {
  batchSize = batchSize - 1; // -1 to account for lastUpdated doc
  const lastUpdateRef = db.collection(collectionName).doc('lastUpdated');
  const numBatches = Math.ceil(dataArray.length / batchSize);

  for (let i = 0; i < numBatches; i++) {
    try {
      const batch = db.batch();
      const startIndex = i * batchSize;
      const endIndex = startIndex + batchSize; // non-inclusive
      const batchArray = dataArray.slice(startIndex, endIndex);

      batchArray.forEach((obj) => {
        const docRef = db.collection(collectionName).doc(obj.id);
        batch.set(docRef, { ...obj });
      });
      batch.set(lastUpdateRef, { timestamp: Date.now() });
      batch.commit();
      console.log('batched');
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * Cloud function that uploads new EB registrants to firestore.
 * Calls getNewAttendees and uploadBatch.
 */
exports.uploadEBAsia = functions.https.onRequest(async () => {
  const data = await getNewAttendees(uploadCollection);
  if (data) {
    uploadBatch(uploadCollection, data);
  } else {
    logger.info('No new attendees');
  }
});

exports.uploadEB = functions.region('asia-southeast1').https.onRequest(async () => {
  const data = await getNewAttendees(uploadCollection);
  if (data) {
    uploadBatch(uploadCollection, data);
  } else {
    logger.info('No new attendees'); // TODO: ERROR HANDLING
  }
});
