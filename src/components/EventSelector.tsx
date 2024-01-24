import { Button, Stack } from '@mui/joy';
import { getAllDocs } from '../utils/firebase/firebase-functions';
import { useEffect, useState } from 'react';
import Event from '../interfaces/Event';

import { db } from '../utils/firebase/firebase-functions';
import { collection, getDocs } from 'firebase/firestore';

// TODO: Remove this function
async function getAllDocsFromSubcollection() {
  const userID = 'abc123';
  const eventID = '0000';
  const collRef = collection(db, 'users', userID, eventID);
  const qSnap = await getDocs(collRef);
  qSnap.forEach((doc) => {
    console.log(doc.data());
  });
}

export default function EventSelector() {
  const [events, setEvents] = useState<Event[]>([]);

  // Populates events array with all existing events
  useEffect(() => {
    getAllDocs('events').then((docs) => {
      setEvents(docs);
    });
  }, []);

  return (
    <Stack>
      {/* Stack of all existing events, using their IDs as a unique key */}
      {events.map((event: Event) => (
        <Button key={event.id} variant="plain">
          {event.Name}
        </Button>
      ))}
      <Button onClick={() => console.log(events)}>logEvents</Button>
      <Button variant="solid" color="danger" onClick={getAllDocsFromSubcollection}>
        GetSubcollections
      </Button>
    </Stack>
  );
}
