import ResultInput from './ResultInput';
import LeadForm from './LeadForm';
import config from '../../../../config.ts';
import { lookupValue } from '../../../firebase-setup/firebase-functions.js';
import { useState, useEffect } from 'react';

function ResultContainer({ result }) {
  const [ebFields, setEbFields] = useState(config.leadFields);

  useEffect(() => {
    async function populateEbFields(obj: object) {
      // TODO: run conditionally - only if firebase lookup returns null
      const doc = (
        await lookupValue(result, config.lookupCollection, config.lookupField)
      )[0];
      const updatedObj = { ...obj };
      for (const key of Object.keys(updatedObj)) {
        if (doc[key]) {
          updatedObj[key] = doc[key];
        }
      }
      return updatedObj;
    }

    populateEbFields(config.leadFields).then((ebFields) => {
      setEbFields(ebFields);
    });
  }, [result]);

  return (
    <div>
      <ResultInput result={result} />
      <hr />
      <LeadForm
        name={ebFields.name}
        email={ebFields.email}
        background={ebFields.background}
        temperature="hot"
        comments=""
      />
    </div>
  );
}

export default ResultContainer;
