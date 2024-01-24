import LeadForm from './LeadForm';
import config from '../../../../config.ts';
import { lookupValue, getCurrentUserEmail } from '../../../utils/firebase/firebase-functions.js';
import { useState, useEffect } from 'react';

function ResultContainer({ result, resetState }) {
  const [leadFields, setLeadFields] = useState<typeof config.leadFields>(config.leadFields);

  useEffect(() => {
    async function populateFields(obj) {
      const updatedObj = { ...obj }; // copy object
      const userEmail = getCurrentUserEmail();
      const userCollectionPath = `users/${userEmail}/741341922647`; // TODO: replace eventID with context value
      const ebCollectionPath = `events/741341922647/eventbrite`;
      // Check if this exists in the collection of scanned leads (i.e. user has been scanned before)
      let doc = (await lookupValue(result, userCollectionPath, config.lookupField))[0];
      if (!doc) {
        // Does not exist, pull from EB
        console.log("ResultContainer: doc doesn't exist");
        doc = (await lookupValue(result, ebCollectionPath, config.lookupField))[0];
        // Creates empty object if not found from EB pull
        if (!doc) {
          doc = {};
          const key = config.lookupField;
          doc[key] = result;
        }
      }

      // update object with values from doc
      for (const key of Object.keys(updatedObj)) {
        if (doc[key]) {
          updatedObj[key] = doc[key];
        }
      }
      return updatedObj;
    }

    populateFields(config.leadFields).then((obj) => {
      setLeadFields(obj);
    });
  }, [result]);

  return (
    <div>
      <hr />
      {<LeadForm leadFields={leadFields} afterSubmit={resetState} />}
    </div>
  );
}

export default ResultContainer;
