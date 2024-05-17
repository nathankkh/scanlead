/* This file contains non-HTTP, helper functions. */

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
 * Takes in an attendee object from an Eventbrite API pull and populates the template `leadfields`.
 * @param {*} attendee An attendee's data from an Eventbrite API pull.
 * @return {Object} A template object with the attendee's data.
 */
function populateAttendeeTemplate(attendee) {
  const template = { ...leadFields };
  template.created = new Date(attendee.created).getTime();
  template.id = attendee.order_id + attendee.id + '001';
  template.name = attendee.profile.name || '';
  template.email = attendee.profile.email || '';
  template.phone = attendee.profile.cell_phone || '';
  template.jobTitle = attendee.profile.job_title || '';
  /*
    0:  Work experience (years)
    1: Field of interest
    2: interested sessions
    3: interested institutions
    4: Capitaland tenant
    5: T&C
  */
  if (attendee.answers) {
    template.experience = attendee.answers[0].answer || '';
    template.fieldOfInterest = attendee.answers[1].answer || '';
  }
  return template;
}

export { leadFields, populateAttendeeTemplate };
