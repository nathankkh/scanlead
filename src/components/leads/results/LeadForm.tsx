import { useState, useEffect } from 'react';
import { getCurrentUserEmail, submitLead } from '../../../firebase-setup/firebase-functions';

function LeadForm({ leadFields, afterSubmit }) {
  const { name, jobTitle, experience, fieldOfInterest, leadType, comments } = leadFields;
  const [leadComment, setLeadComment] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    setType(leadType === '' ? 'warm' : leadType);
    setLeadComment(comments);
  }, [comments, leadType]);

  function handleRadioChange(e) {
    setType(e.target.value);
  }

  function handleCommentsChange(e) {
    setLeadComment(e.target.value);
  }

  function updateLead() {
    const updatedLeadfields = { ...leadFields };
    updatedLeadfields.comments = leadComment;
    updatedLeadfields.leadType = type;
    updatedLeadfields.timestamp = Date.now();
    console.log(updatedLeadfields);
    return updatedLeadfields;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const lead = updateLead();
    try {
      const docName = getCurrentUserEmail() + '_' + leadFields.id;
      submitLead(lead, docName).then(afterSubmit);
      //TODO: add toast message
    } catch (err) {
      console.log(err);
      alert('Please submit again');
    }
  }

  return (
    <>
      <h1>Form</h1>
      <form className="lead-form" onSubmit={handleFormSubmit}>
        <label
          htmlFor="name"
          className="lead-form-field"
          placeholder="<Loading from database, will be present in the exported file>"
        >
          Name:
        </label>
        <input type="text" id="name" value={name} disabled />

        <label htmlFor="jobTitle" className="lead-form-field">
          Job Title:
        </label>
        <input type="text" id="jobTitle" value={jobTitle} disabled />

        <label htmlFor="experience" className="lead-form-field">
          Experience:
        </label>
        <input type="text" id="experience" value={experience} disabled />

        <label htmlFor="fieldOfInterest" className="lead-form-field">
          Field of Interest:
        </label>
        <input type="text" id="fieldOfInterest" value={fieldOfInterest} disabled />

        <label htmlFor="comments" className="lead-form-field">
          Comments:
        </label>
        <textarea id="comments" defaultValue={leadComment} onChange={handleCommentsChange} />

        <fieldset>
          <legend>Lead Type:</legend>
          <label>
            <input
              type="radio"
              name="leadType"
              value="cold"
              checked={type === 'cold'}
              onChange={handleRadioChange}
            />
            Cold
          </label>

          <label>
            <input
              type="radio"
              name="leadType"
              value="warm"
              checked={type === 'warm'}
              onChange={handleRadioChange}
            />
            Warm
          </label>

          <label>
            <input
              type="radio"
              name="leadType"
              value="hot"
              checked={type === 'hot'}
              onChange={handleRadioChange}
            />
            Hot
          </label>
        </fieldset>

        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default LeadForm;
