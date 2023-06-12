import { useState } from 'react';

function LeadForm({ name, email, background, temperature, comments }) {
  const [leadComment, setLeadComment] = useState(comments);
  // GET TIMESTAMP

  return (
    <>
      <h1>Lookup Form</h1>
      <form>
        <label htmlFor="name">Name: </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          readOnly
          disabled
        />
        <br />
        <label htmlFor="email">Email: </label>
        <input
          type="text"
          id="email"
          name="email"
          value={email}
          readOnly
          disabled
        />
        <br />
        <label htmlFor="background">Background: </label>
        <input
          type="text"
          id="background"
          name="background"
          value={background}
          readOnly
          disabled
        />
        <br />
        <label htmlFor="temperature">Temperature: </label>
        <input
          type="text"
          id="temperature"
          name="temperature"
          value={temperature}
          readOnly
          disabled
        />{' '}
        {/* TODO: Make this a group of radio buttons */}
        <br />
        <label htmlFor="comments">Comments: </label>
        <input
          type="text"
          id="comments"
          name="comments"
          value={leadComment}
          onChange={(e) => setLeadComment(e.target.value)}
        />
      </form>
    </>
  );
}

export default LeadForm;
