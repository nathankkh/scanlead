import { useState, useEffect } from 'react';
import { getCurrentUserEmail, submitLead } from '../../../firebase-setup/firebase-functions';

function LeadForm({ leadFields }) {
  const { name, email, background, temperature, comments } = leadFields;
  const [leadComment, setLeadComment] = useState(comments);
  const [leadTemperature, setLeadTemperature] = useState(temperature);

  useEffect(() => {
    setLeadComment(comments);
    setLeadTemperature(temperature);
  }, [comments, temperature]);

  function handleRadioChange(e) {
    setLeadTemperature(e.target.value);
  }

  function handleCommentsChange(e) {
    setLeadComment(e.target.value);
  }

  function updateLead() {
    const updatedLeadfields = { ...leadFields };
    updatedLeadfields.comments = leadComment;
    updatedLeadfields.temperature = leadTemperature;
    updatedLeadfields.timestamp = Date.now();
    console.log(updatedLeadfields);
    return updatedLeadfields;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const lead = updateLead();
    try {
      const docName = getCurrentUserEmail() + '_' + leadFields.id;
      submitLead(lead, docName).then(() => window.location.reload());
      //TODO: add toast message
    } catch (err) {
      console.log(err);
      alert('Please submit again');
    }
  }

  return (
    <>
      <h1>Lookup Form</h1>
      <form className="lead-form" onSubmit={handleFormSubmit}>
        <label htmlFor="name" className="lead-form-field">
          Name:
        </label>
        <input type="text" id="name" value={name} readOnly disabled />

        <label htmlFor="email" className="lead-form-field">
          Email:
        </label>
        <input type="email" id="email" value={email} readOnly disabled />

        <label htmlFor="background" className="lead-form-field">
          Background:
        </label>
        <input type="text" id="background" value={background} readOnly disabled />

        <label htmlFor="comments" className="lead-form-field">
          Comments:
        </label>
        <textarea id="comments" defaultValue={leadComment} onChange={handleCommentsChange} />

        <fieldset>
          <legend>Temperature:</legend>
          <label>
            <input
              type="radio"
              name="temperature"
              value="cold"
              checked={leadTemperature === 'cold'}
              onChange={handleRadioChange}
            />
            Cold
          </label>

          <label>
            <input
              type="radio"
              name="temperature"
              value="medium"
              checked={leadTemperature === 'medium'}
              onChange={handleRadioChange}
            />
            Medium
          </label>

          <label>
            <input
              type="radio"
              name="temperature"
              value="hot"
              checked={leadTemperature === 'hot'}
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
