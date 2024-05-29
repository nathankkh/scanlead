import { useState, useEffect, useRef, useContext } from 'react';
import { getCurrentUser, submitLead } from '../../../utils/firebase/firebase-functions';
import EventContext from '../../../utils/EventContext.ts';

import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import FormLabel from '@mui/joy/FormLabel';
import Typography from '@mui/joy/Typography';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Textarea from '@mui/joy/Textarea';
import FormControl from '@mui/joy/FormControl';

function LeadForm({ leadFields, afterSubmit }) {
  const { name, jobTitle, experience, fieldOfInterest, leadType, comments } = leadFields;
  const [type, setType] = useState('');
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const currentEvent = useContext(EventContext).currentEvent;
  const eventID = currentEvent?.id;

  // Modifies state when user changes lead type or comments
  useEffect(() => {
    setType(leadType === '' ? 'warm' : leadType);
  }, [leadType]);

  function handleRadioChange(e) {
    setType(e.target.value);
  }

  /* function handleCommentsChange(e) {
    setLeadComment(e.target.value);
  } */

  function updateLead() {
    const updatedLeadfields = { ...leadFields };
    updatedLeadfields.comments = commentRef.current != null ? commentRef.current.value : '';
    updatedLeadfields.leadType = type;
    updatedLeadfields.timestamp = Date.now();
    console.log(updatedLeadfields);
    return updatedLeadfields;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const lead = updateLead();
    try {
      const docName = getCurrentUser() + '_' + leadFields.id;
      submitLead(lead, docName, eventID).then(afterSubmit);
    } catch (err) {
      console.log(err);
      alert('Please submit again');
    }
  }

  return (
    <>
      <Box sx={{ overflow: 'auto' }}>
        <form>
          {/* Name */}
          <FormLabel>
            <Typography>Name&nbsp;</Typography>
            <Typography color="danger">(Read-only)</Typography>
          </FormLabel>
          <Textarea
            readOnly
            color="neutral"
            value={name}
            placeholder="<Loading details from database, will be present in the exported file>"
            sx={{ mb: 2 }}
          ></Textarea>
          {/* Job Title */}
          <FormLabel>
            <Typography>Job Title&nbsp;</Typography>
            <Typography color="danger">(Read-only)</Typography>
          </FormLabel>
          <Textarea readOnly value={jobTitle} sx={{ mb: 2 }}></Textarea>
          {/* Working Experience */}
          <FormLabel>
            <Typography>Experience&nbsp;</Typography>
            <Typography color="danger">(Read-only)</Typography>
          </FormLabel>
          <Textarea readOnly value={experience} sx={{ mb: 2 }}></Textarea>
          {/* Field of Interest */}
          <FormLabel>
            <Typography>Field of Interest&nbsp;</Typography>
            <Typography color="danger">(Read-only)</Typography>
          </FormLabel>
          <Textarea readOnly value={fieldOfInterest} sx={{ mb: 2 }}></Textarea>
          {/* Comments */}
          <FormLabel>
            <Typography>Comments</Typography>
          </FormLabel>
          <Textarea
            defaultValue={comments} //{leadComment}
            slotProps={{ textarea: { ref: commentRef } }}
            minRows={3}
            maxRows={6}
            // onChange={handleCommentsChange}
          ></Textarea>
          {/* Radio buttons */}
          <FormControl component="fieldset" sx={{ display: 'inline-block', border: 'none' }}>
            <FormLabel sx={{ display: 'inline-block', mt: 2 }}>
              <Typography>Lead Type</Typography>
            </FormLabel>
            <RadioGroup
              defaultValue="warm"
              value={type}
              onChange={handleRadioChange}
              orientation="horizontal"
            >
              <Radio value="cold" label="Cold" />
              <Radio value="warm" label="Warm" />
              <Radio value="hot" label="Hot" />
            </RadioGroup>
          </FormControl>
          <br />
          <Button sx={{ mt: 2 }} onClick={handleFormSubmit}>
            Submit
          </Button>
        </form>
      </Box>
    </>
  );
}

export default LeadForm;
