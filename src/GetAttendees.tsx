import config from '../config.ts';
import { doc, getDoc } from 'firebase/firestore';
import { db, uploadBatch } from './firebase-setup/firebase-functions';

const hhID = 'CHANGEME';
const hhKey = 'CHANGEME';
function GetAttendees() {
  /**
   * Retrieves ALL attendees from eventbrite
   * @param pageNumber Page number of returned data to pull. 1 by default.
   * @returns JSON of returned data from eventbrite. Contains 2 parent keys: pagination and attendees
   */
  async function getData(pageNumber = 1) {
    try {
      const response = await fetch(
        'https://www.eventbriteapi.com/v3/events/' +
          `${hhID}` +
          '/attendees/?page=' +
          `${pageNumber}`,
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + hhKey
          }
        }
      );
      const data = await response.json();
      console.log('awaiting');
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Retrieves attendees from eventbrite that are created after the last update time.
   * Loops through attendees returned from eventbrite and compares created time with last update time.
   * If no last update time is found, retrieves all attendees.
   */
  async function getNewAttendees() {
    const lastUpdateRef = doc(db, config.lookupCollection, 'lastUpdated');
    const lastUpdateDocSnap = await getDoc(lastUpdateRef);
    const result: Array<typeof config.leadFields> = [];
    let pageNumber = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const data = await getData(pageNumber); // Alternative: Get continuation token
      const filteredAttendees = data.attendees.filter((attendee: { created: string }) => {
        if (lastUpdateDocSnap.exists()) {
          // filters only attendees who registered after last update time
          return new Date(attendee.created).getTime() > lastUpdateDocSnap.data().timestamp;
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
    console.log(result);
    return result;
  }

  function populateAttendeeTemplate(attendee) {
    const template = { ...config.leadFields };
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

  async function uploadEB() {
    const data = await getNewAttendees();
    if (data) {
      uploadBatch(config.lookupCollection, data); //TODO: Change collection name
    } else {
      alert('Empty array'); // TODO: error handling
    }
  }

  return (
    <>
      <button onClick={uploadEB}>Get Attendees</button>
    </>
  );
}

export default GetAttendees;
