import { useState } from 'react';
import {
  submitLead,
  getCurrentUserEmail
} from '../../../firebase-setup/firebase-functions';

function ResultInput(props) {
  const [leadTemperature, setLeadTemperature] = useState('medium'); // ['cold', 'medium', 'hot'
  const [leadComment, setLeadComment] = useState('');
  const result = props.result;

  function handleRadioChange(e) {
    setLeadTemperature(e.target.value);
  }

  function createLead() {
    //FIXME: Fully implement lead creation
    const lead = {
      registrantID: result,
      temperature: leadTemperature,
      comments: leadComment
    };
    return lead;
  }

  function handleSubmit() {
    const lead = createLead();
    console.log(lead);
    try {
      const docName = getCurrentUserEmail() + '_' + result;
      submitLead(lead, docName);

      // Clear inputs
      setLeadComment('');
      setLeadTemperature('medium');

      console.log('submitted');
    } catch (error) {
      console.log(error);
      alert('submit again'); //TODO: add error message
    }
  }

  return (
    <>
      <form>
        <div id="leadRadioContainer">
          <input
            type="radio"
            name="leadTemperature"
            id="radioChoiceCold"
            value="cold"
            onChange={handleRadioChange}
          />
          <label htmlFor="radioChoiceCold">Cold</label>

          <input
            type="radio"
            name="leadTemperature"
            id="radioChoiceMedium"
            value="medium"
            onChange={handleRadioChange}
            checked={leadTemperature === 'medium'} // makes this the default check; allows selection to be reset upon submission
          />
          <label htmlFor="radioChoiceMedium">Medium</label>

          <input
            type="radio"
            name="leadTemperature"
            id="radioChoiceHot"
            value="hot"
            onChange={handleRadioChange}
          />
          <label htmlFor="radioChoiceHot">Hot</label>
        </div>

        <input
          type="text"
          id="leadComment"
          placeholder="Enter Comment"
          value={leadComment}
          onChange={(e) => setLeadComment(e.target.value)}
        />

        <button
          type="button"
          onClick={() => {
            handleSubmit();
          }}
        >
          Submit Lead
        </button>
      </form>
    </>
  );
}

export default ResultInput;
