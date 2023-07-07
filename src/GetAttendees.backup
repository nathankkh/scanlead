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
   * @returns Array of attendees that are created after the last update time.
   */
  async function getNewAttendees() {
    try {
      const lastUpdateDoc = await getDoc(doc(db, 'temp', 'lastUpdate'));
      const lastUpdateTime = lastUpdateDoc.exists() ? lastUpdateDoc.data().timestamp : 0;
      console.log('last update time: ' + `${lastUpdateTime}`);
      const result = [];
      let currentPage = 1;
      let lastCreated = Number.NEGATIVE_INFINITY;

      const initialData = await getData(currentPage);
      const totalPages = initialData.pagination.page_count;
      console.log(totalPages);
      currentPage = totalPages;

      // iterate through remaining pages from the back
      for (currentPage; currentPage >= 1; currentPage--) {
        console.log('inside loop: ' + `${currentPage}`);
        const data = await getData(currentPage);

        const filteredAttendees = data.attendees.filter((attendee) => {
          return new Date(attendee.created).getTime() > lastUpdateTime;
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
      console.log([result, lastCreated]);
      return [result, lastCreated];
    } catch (error) {
      console.log(error);
    }
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
      uploadBatch('testing', data[0], data[1]); //TODO: Change collection name
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
