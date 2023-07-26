/* eslint @typescript-eslint/no-var-requires: "off" */
// See a full list of supported triggers at https://firebase.google.com/docs/functions

const logger = require('firebase-functions/logger');
const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
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

const uploadCollection = 'eventbrite';

/**
 * Retrieves key from google secret manager
 * @return {Promise<string>} Secret value from Google Secret Manager
 */
async function getEBKey() {
  const client = new SecretManagerServiceClient();
  const name = 'projects/292470144917/secrets/EB_key/versions/2';

  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

/**
 * Retrieves EB Event ID from google secret manager
 * @return {Promise<string>} Secret value from Google Secret Manager
 */
async function getEventID() {
  const client = new SecretManagerServiceClient();
  const name = 'projects/292470144917/secrets/EB_event_id/versions/latest';

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
  const key = await getEBKey();
  const eventID = await getEventID();
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
    logger.info('data retrieved');
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
  template.jobTitle = attendee.profile.job_title;
  /*
    0: Where did you hear of this event
    1: Work experience (years)
    2: Field of interest
    3: interested sessions
    4: T&C
  */
  template.experience = attendee.answers[1].answer; // can match question_id too
  template.fieldOfInterest = attendee.answers[2].answer;
  return template;
}

/**
 * Retrieves all new attendees from eventbrite.
 * Calls `getData()` to retrieve all attendees from eventbrite.
 * Calls firestore to see if there is a lastUpdated doc. If so, filters out attendees who were added to the collection after the last update time.
 * Uploads all new attendees to firestore.
 * Note that this relies on Eventbrite's api to return two parent keys: pagination and attendees.
 * @param {string} collectionName Name of collection to upload to.
 * @return {Promise<Array<Array, Number>>} A promise of an Array. The first element is an array of new attendees. The second element is the time of the most recently created attendee.
 */
async function getNewAttendees(collectionName) {
  try {
    const lastUpdateDoc = await db.collection(`${collectionName}`).doc('lastUpdated').get();
    const lastUpdateTime = lastUpdateDoc.exists ? lastUpdateDoc.data().timestamp : 0;
    const result = [];
    let currentPage = 1;
    let lastCreated = Number.NEGATIVE_INFINITY;
    // TODO: make use of initial call.
    const initialData = await getData(currentPage);
    const totalPages = initialData.pagination.page_count;

    // iterate through pages from the back. Note that this prevents the use of continuation tokens
    for (currentPage = totalPages; currentPage >= 1; currentPage--) {
      const data = await getData(currentPage);
      const filteredAttendees = data.attendees.filter((attendee) => {
        return new Date(attendee.created).getTime() > lastUpdateTime && attendee.cancelled == false;
      });
      for (const attendee of filteredAttendees) {
        if (new Date(attendee.created).getTime() > lastCreated) {
          lastCreated = new Date(attendee.created).getTime();
        }
        const template = populateAttendeeTemplate(attendee);
        result.push(template);
      }

      // prevent extra API calls if the most recent call had more new attendees
      if (filteredAttendees.length == 0) {
        break;
      }
      // TODO: optimise further, check whether filtered attendee length is less than current page size
    }
    return [result, lastCreated];
  } catch (error) {
    logger.error(error);
  }
}

/**
 * Uploads an array of documents to a given collection in Firestore as one or more batchWrites.
 * @param {string} collectionName The name of the collection in Firestore to upload the documents to.
 * @param {Array} dataArray An array of documents to upload. Each document should be an object with data stored as key-value pairs.
 * @param {number} lastUpdateTime Milliseconds since epoch. Used to update the lastUpdated doc.
 * @param {number} batchSize The number of operations per batch. Default is 500.
 */
async function uploadBatch(collectionName, dataArray, lastUpdateTime, batchSize = 500) {
  batchSize = batchSize - 1; // -1 to account for lastUpdated doc
  const lastUpdateRef = db.collection(collectionName).doc('lastUpdated');
  const numBatches = Math.ceil(dataArray.length / batchSize);

  for (let i = 0; i < numBatches; i++) {
    try {
      const batch = db.batch(); // init batch
      const startIndex = i * batchSize;
      const endIndex = startIndex + batchSize;
      const batchArray = dataArray.slice(startIndex, endIndex); // slices the array into batches

      batchArray.forEach((obj) => {
        // set the name of the doc to be the id of the attendee
        const docRef = db.collection(collectionName).doc(obj.id);
        batch.set(docRef, { ...obj });
      });

      batch.set(lastUpdateRef, {
        timestamp: lastUpdateTime,
        'timestamp datetime': new Date(lastUpdateTime)
      });
      batch.commit();
      logger.info('batched');
    } catch (err) {
      logger.error(err);
    }
  }
}

/**
 * Uploads all new attendees from eventbrite.
 * Used for testing purposes.
 * @deprecated
 */
exports.uploadEB = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
  const data = await getNewAttendees(uploadCollection);
  if (data) {
    uploadBatch(uploadCollection, data[0], data[1]);
    logger.info('done');
    res.send('done');
  } else {
    logger.info('No new attendees'); // TODO: ERROR HANDLING
    res.send('error');
  }
});

/**
 * Uploads all new attendees from eventbrite every minute.
 */
exports.uploadEBpubSub = functions
  .region('asia-southeast1')
  .pubsub.schedule('every minute')
  .onRun(async () => {
    const data = await getNewAttendees(uploadCollection);
    if (data) {
      uploadBatch(uploadCollection, data[0], data[1]);
      logger.info('done');
    } else {
      logger.info('No new attendees'); // TODO: ERROR HANDLING
    }
  });
