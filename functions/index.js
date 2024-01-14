/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/* eslint @typescript-eslint/no-var-requires: "off" */

const logger = require('firebase-functions/logger');
const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

initializeApp();
const db = getFirestore();
const client = new SecretManagerServiceClient();

const leadFields = {
  created: '', // timestamp
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

/**
 * Retrieves key from google secret manager
 * @return {Promise<string>} Secret value from Google Secret Manager
 */
async function getEBKey() {
  const name = 'projects/292470144917/secrets/EB_key/versions/HH';

  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

/**
 * Retrieves EB Event ID from google secret manager
 * @return {Promise<string>} Secret value from Google Secret Manager
 */
async function getEventID() {
  const name = 'projects/292470144917/secrets/EB_event_id/versions/latest';

  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

/**
 * Retrieves a page of attendees from eventbrite
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
    logger.error('Error in getData()');
  }
}

/**
 * Takes in an attendee object from an Eventbrite API pull and populates the template `leadfields`.
 * @param {*} attendee An attendee's data from an Eventbrite API pull.
 * @return {json} JSON of attendee data.
 */
function populateAttendeeTemplate(attendee) {
  const template = { ...leadFields };
  template.created = new Date(attendee.created).getTime();
  template.id = attendee.order_id + attendee.id + '001';
  template.name = attendee.profile.name;
  template.email = attendee.profile.email;
  template.phone = attendee.profile.cell_phone;
  template.jobTitle = attendee.profile.job_title;
  /*
    0:  Work experience (years)
    1: Field of interest
    2: interested sessions
    3: interested institutions
    4: Capitaland tenant
    5: T&C
  */
  template.experience = attendee.answers[0].answer; // can match question_id too
  template.fieldOfInterest = attendee.answers[1].answer;
  return template;
}

/**
 * Retrieves all new attendees from eventbrite.
 * Calls `getData()` to retrieve all attendees from eventbrite.
 * Calls firestore to see if there is a lastUpdated doc. If so, filters out attendees who were added to the collection after the last update time.
 * Uploads all new attendees to firestore.
 * Note that this relies on Eventbrite's api to return two parent keys: pagination and attendees.
 * @param {string} collectionPath Slash separated string of the collection path. e.g. '/events/123/eventbrite'
 * @return {Promise<Array<Array, Number>>} A promise of an Array. The first element is an array of new attendees. The second element is the time of the most recently created attendee.
 */
async function getNewAttendees(collectionPath) {
  // retrieve last updated time from firestore
  // if no last updated time, retrieve all attendees
  // if last updated time, retrieve attendees after last updated time
  // upload attendees to firestore
  // update last updated time, with the timestamp of the most recent registration
  // return new attendees
  try {
    const lastUpdateDoc = await db.collection(collectionPath).doc('0_lastUpdated').get();
    const lastUpdateTime = lastUpdateDoc.exists ? lastUpdateDoc.data().timestamp : 0;
    const result = [];
    let currentPage = 1;
    let lastCreated = Number.NEGATIVE_INFINITY;
    // TODO: make use of initial call.
    const initialData = await getData(currentPage);
    const totalPages = initialData.pagination.page_count;
    let couldHaveCancellations = true;
    // iterate through pages from the back. Note that this prevents the use of continuation tokens
    for (currentPage = totalPages; currentPage >= 1; currentPage--) {
      logger.info('page: ' + currentPage);
      const data = await getData(currentPage);
      // CHECK FOR CANCELLATIONS =============================
      if (couldHaveCancellations) {
        const cancelledAttendees = data.attendees.filter((attendee) => {
          return attendee.cancelled == true;
        });
        // prevent additional checks for cancelled attendees IF the entire page has no cancellations
        // this is valid because the API pushes cancelled attendees to the back
        if (cancelledAttendees.length == 0) {
          couldHaveCancellations = false;
        }
      }
      // =====================================================

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

      // prevent extra API calls if the most recent call had more new attendees AND there are no cancelled attendees
      if (filteredAttendees.length == 0 && couldHaveCancellations == false) {
        break;
      }
    }
    return [result, lastCreated];
  } catch (error) {
    logger.error(error);
    logger.error('Error in getNewAttendees()');
  }
}

/**
 * Updates lastpulled time in the event that there are no new attendees
 * @param {String} collectionPath Slash separated string of the collection path. e.g. '/events/123/eventbrite'
 */
async function updatePullTime(collectionPath) {
  const lastUpdateRef = db.collection(collectionPath).doc('0_lastUpdated');
  try {
    await lastUpdateRef.set(
      {
        lastpull: new Date().toString()
      },
      { merge: true }
    );
    logger.info('[Cloud fn] Updated lastpull time');
  } catch (error) {
    logger.error(error);
    logger.error('Error in updatePullTime');
  }
}

/**
 * Uploads an array of documents to a given collection in Firestore as one or more batchWrites.
 * @param {string} collectionPath Slash separated string of the collection path. e.g. '/events/123/eventbrite'
 * @param {Array} dataArray An array of documents to upload. Each document should be an object with data stored as key-value pairs.
 * @param {number} lastUpdateTime Milliseconds since epoch. Used to update the lastUpdated doc.
 * @param {number} batchSize The number of operations per batch. Default is 500.
 */
async function uploadBatch(collectionPath, dataArray, lastUpdateTime, batchSize = 500) {
  // TODO: UPDATE to match new folder structure
  batchSize = batchSize - 1; // -1 to account for lastUpdated doc
  const lastUpdateRef = db.collection(collectionPath).doc('0_lastUpdated');
  logger.info('[Cloud fn] Number of records to upload: ' + dataArray.length);
  const numBatches = Math.ceil(dataArray.length / batchSize);

  for (let i = 0; i < numBatches; i++) {
    try {
      const batch = db.batch(); // init batch
      const startIndex = i * batchSize;
      const endIndex = startIndex + batchSize;
      const batchArray = dataArray.slice(startIndex, endIndex); // slices the array into batches

      batchArray.forEach((obj) => {
        // set the name of the doc to be the id of the attendee
        const docRef = db.collection(collectionPath).doc(obj.id);
        batch.set(docRef, { ...obj });
      });

      batch.set(lastUpdateRef, {
        timestamp: lastUpdateTime,
        'timestamp datetime': new Date(lastUpdateTime),
        lastpull: new Date().toString()
      });
      batch.commit();
      logger.info('batched');
    } catch (err) {
      logger.error(err);
      logger.error("Couldn't batch");
    }
  }
}

/* exports.testUpdatePullTime = onRequest(async (request, response) => {
  // tests if updatePullTime works
  let eventID = await getEventID();
  let collectionName = 'eventbrite';
  const ebCollectionPath = '/events/' + `${eventID}` + '/' + `${collectionName}`;
  try {
    updatePullTime(ebCollectionPath).then(() => {
      response.send('done');
    });
  } catch (e) {
    logger.error(e);
  }
}); */

/* exports.testBatch = onRequest(async (request, response) => {
  // tests batch upload by uploading the first page from an EB pull
  let eventID = await getEventID();
  let collectionName = 'eventbrite';
  const ebCollectionPath = '/events/' + `${eventID}` + '/' + `${collectionName}`;
  const data = await getData();
  const attendees = data.attendees;
  const batchArray = [];
  attendees.forEach((attendee) => {
    const template = populateAttendeeTemplate(attendee);
    batchArray.push(template);
  });
  uploadBatch(ebCollectionPath, batchArray, new Date().getTime()).then(() => {
    response.send('done');
  });
}); */
/**
 * Pulls new attendees from eventbrite when triggered.
 */
/* exports.pullNewAttendees = onRequest({ timeoutSeconds: 300 }, async (request, response) => {
  const eventID = await getEventID();
  const collectionName = 'eventbrite';
  const ebCollectionPath = '/events/' + `${eventID}` + '/' + `${collectionName}`;
  const data = await getNewAttendees(ebCollectionPath);
  if (data) {
    uploadBatch(ebCollectionPath, data[0], data[1]).then(() => {
      response.send('done');
    });
  } else {
    updatePullTime(ebCollectionPath).then(() => {
      response.send('no new');
    });
  }
}); */

/* eslint @typescript-eslint/no-unused-vars: "off" */
/**
 * Pulls new attendees from eventbrite every 5 minutes.
 * Uses functions v1
 */
exports.pullNewAttendeesScheduled = functions
  .region('asia-east1')
  .runWith({ timeoutSeconds: 300 })
  .pubsub.schedule('every 3 minutes')
  .onRun(async () => {
    const eventID = await getEventID();
    const collectionName = 'eventbrite';
    const ebCollectionPath = '/events/' + `${eventID}` + '/' + `${collectionName}`;
    const data = await getNewAttendees(ebCollectionPath);
    if (data) {
      uploadBatch(ebCollectionPath, data[0], data[1]).then(() => {
        logger.info('[CF Scheduled] done');
      });
    } else {
      updatePullTime(ebCollectionPath).then(() => {
        logger.info('no new attendees');
      });
    }
  });
