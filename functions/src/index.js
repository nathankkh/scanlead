/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/* eslint @typescript-eslint/no-var-requires: "off" */

// TODO: Create an auth-triggered cloud function triggered on event selection to add event to exhibitor details
const logger = require('firebase-functions/logger');
const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

/* Begin V2 imports */
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
/* End V2 imports */

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
    logger.debug('number of records on page ' + pageNumber + ': ' + data.pagination.page_size);
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
  template.experience = attendee.answers[0].answer;
  template.fieldOfInterest = attendee.answers[1].answer;
  return template;
}

/**
 * Retrieves all new attendees from eventbrite.
 * Calls `getData()` to retrieve all attendees from eventbrite.
 * Calls firestore to see if there is a lastUpdated doc. If so, filters out attendees who were added to the collection after the last update time.
 * Uploads all new attendees to firestore.
 * Note that this relies on Eventbrite's api to return two parent keys: pagination and attendees.
 * @param {string} collectionPath Slash separated string of the collection path where eventbrite attendees are stored. e.g. '/events/123/eventbrite'
 * @return {Promise<Array<Array, number>>} A promise of an Array. The first element is an array of new attendees. The second element is the time of the most recently created attendee.
 */
async function getNewAttendees(collectionPath) {
  // if last updated time, retrieve attendees after last updated time
  // upload attendees to firestore
  // update last updated time, with the timestamp of the most recent registration
  // return new attendees
  try {
    // get last updated time from FireStore. If it doesn't exist, set it to 0
    const lastUpdateDoc = await db.collection(collectionPath).doc('0_lastUpdated').get();
    const lastUpdateTime = lastUpdateDoc.exists ? lastUpdateDoc.data().timestamp : 0;

    const result = [];

    // Make initial call to Eventbrite to get total number of pages.
    let currentPage = 1;
    let lastCreated = Number.NEGATIVE_INFINITY;
    // TODO: make use of initial call.
    const initialData = await getData(currentPage);
    const totalPages = initialData.pagination.page_count;
    let couldHaveCancellations = true;

    // iterate through pages from the back. Note that this prevents the use of continuation tokens
    for (currentPage = totalPages; currentPage >= 1; currentPage--) {
      logger.debug('[Cloud fn] getNewAttendees page: ' + currentPage);
      const data = await getData(currentPage);

      // CHECK FOR CANCELLATIONS. Affects behaviour for exiting EB pulls early. ===================
      if (couldHaveCancellations) {
        const cancelledAttendees = data.attendees.filter((attendee) => {
          return attendee.cancelled == true;
        });
        // prevent additional checks for cancelled attendees IF the entire page has no cancellations
        // this works because the API pushes cancelled attendees to the back of the returned data
        if (cancelledAttendees.length == 0) {
          couldHaveCancellations = false;
        }
      }
      // ========================================================================================

      // only include attendees who were added to the collection after the last update time
      const filteredAttendees = data.attendees.filter((attendee) => {
        return new Date(attendee.created).getTime() > lastUpdateTime && attendee.cancelled == false;
      });

      // populate the template and push to result array
      for (const attendee of filteredAttendees) {
        if (new Date(attendee.created).getTime() > lastCreated) {
          lastCreated = new Date(attendee.created).getTime();
        }
        const template = populateAttendeeTemplate(attendee);
        result.push(template);
      }

      // prevent extra API calls if the most recent call had more new attendees AND there are no cancelled attendees
      if (filteredAttendees.length == 0 && couldHaveCancellations == false) {
        logger.debug('[Cloud fn] getNewAttendees: no new attendees found for page ' + currentPage);
        break;
      }
    }
    return [result, lastCreated];
  } catch (error) {
    logger.error('Error in getNewAttendees(): ' + error);
  }
}

/**
 * Updates lastpulled time in the event that there are no new attendees. Updates with the current time.
 * @param {String} collectionPath Slash separated string of the collection path. e.g. '/events/123/eventbrite'
 */
async function updatePullTime(collectionPath) {
  // Create reference to lastUpdated document.
  const lastUpdateRef = db.collection(collectionPath).doc('0_lastUpdated');

  // Get current time in UTC+8
  const now = new Date();
  const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const gmt8Time = new Date(nowUTC.getTime() + 3600000 * 8);

  // Update 0_lastUpdated doc with current time.
  try {
    await lastUpdateRef.set(
      {
        lastpull: gmt8Time.toString()
      },
      { merge: true }
    );
    logger.debug('[Cloud fn] Updated lastpull time');
  } catch (error) {
    logger.error('Error in updatePullTime: ' + error);
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
  batchSize = batchSize - 1; // -1 to account for lastUpdated doc
  const lastUpdateRef = db.collection(collectionPath).doc('0_lastUpdated');
  logger.debug('[Cloud fn] Number of records to upload: ' + dataArray.length);
  const numBatches = Math.ceil(dataArray.length / batchSize);

  // Split the array into batches and upload
  for (let i = 0; i < numBatches; i++) {
    try {
      const batch = db.batch(); // init batch
      const startIndex = i * batchSize;
      const endIndex = startIndex + batchSize;
      const batchArray = dataArray.slice(startIndex, endIndex); // slices the array into batches

      // iterate through each attendee in batchArray and add to batch object.
      batchArray.forEach((obj) => {
        // set the name of the doc to be the id of the attendee
        const docRef = db.collection(collectionPath).doc(obj.id);
        // add doc to the batch
        batch.set(docRef, { ...obj });
        ``;
      });

      batch.set(lastUpdateRef, {
        timestamp: lastUpdateTime,
        'timestamp datetime': new Date(lastUpdateTime),
        lastpull: new Date().toString()
      });
      await batch.commit();
      logger.debug('batched');
    } catch (err) {
      logger.error(err);
      logger.error("Couldn't batch");
      // No need to throw error here, as the next batch will still be attempted.
    }
  }
}

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

/**
 * Pulls new attendees from eventbrite every 5 minutes.
 * Uses functions v2.
 * Follows runtime options that are set in Google Cloud.
 */
exports.pullNewAttendeesV2 = onSchedule(
  {
    preserveExternalChanges: true,
    schedule: 'every minute',
    timeZone: 'Asia/Singapore',
    region: 'asia-east1'
  },
  async () => {
    const eventID = await getEventID();
    const collectionName = 'eventbrite';
    const ebCollectionPath = '/events/' + `${eventID}` + '/' + `${collectionName}`;
    const data = await getNewAttendees(ebCollectionPath);
    if (data) {
      uploadBatch(ebCollectionPath, data[0], data[1]).then(() => {
        logger.info('[CF V2] done');
      });
    } else {
      updatePullTime(ebCollectionPath).then(() => {
        logger.info('no new attendees');
      });
    }
  }
);

/**
 * Pulls new attendees from eventbrite when triggered.
 * Manual trigger for testing purposes.
 */
exports.pullNewAttendeesManual = onRequest(async (request, response) => {
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
});
