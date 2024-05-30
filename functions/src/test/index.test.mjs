import * as func from '../index.js';
import * as utils from '../utils.js';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

/*
const app = admin.initializeApp({
  projectId: 'scanlead-17f3a',
  credential: admin.credential.applicationDefault()
});

const db = app.firestore();
db.settings({
  host: 'localhost',
  port: 8080
});
*/

// run emulator separately. Running jest should trigger the test functions here

describe('populateAttendeeTemplate', () => {
  test("should return a template object with the attendee's data", () => {
    const attendee = {
      created: '2021-02-17T20:00:00Z',
      order_id: '123',
      id: '456',
      profile: {
        name: 'John Doe',
        email: ''
      }
    };
    const expected = {
      created: 1613592000000,
      id: '123456001',
      name: 'John Doe',
      email: '',
      phone: '',
      jobTitle: '',
      experience: '',
      fieldOfInterest: '',
      comments: '',
      leadType: ''
    };
    expect(utils.populateAttendeeTemplate(attendee)).toEqual(expected);
  }, 10000);
});
