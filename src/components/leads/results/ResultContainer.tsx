import LeadForm from './LeadForm';
import config from '../../../../config.ts';
import { lookupValue, getCurrentUserEmail } from '../../../firebase-setup/firebase-functions.js';
import { useState, useEffect } from 'react';

function ResultContainer({ result }) {
  const [leadFields, setLeadFields] = useState<typeof config.leadFields>(config.leadFields);

  useEffect(() => {
    async function populateFields(obj) {
      const updatedObj = { ...obj }; // copy object
      // Check if this exists in the collection of scanned leads (i.e. user has been scanned before)
      let doc = (await lookupValue(result, getCurrentUserEmail(), config.lookupField))[0];
      if (!doc) {
        // Does not exist, pull from EB
        doc = (await lookupValue(result, config.lookupCollection, config.lookupField))[0];
        // FIXME: Create empty object if not found
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
      <hr /> {/* TODO: remove */}
      {<LeadForm leadFields={leadFields} afterSubmit={() => window.location.reload()} />}
    </div>
  );
}

export default ResultContainer;
