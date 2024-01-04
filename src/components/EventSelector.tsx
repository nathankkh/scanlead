import { Button, Stack } from '@mui/joy';
import { getAllDocs } from '../utils/firebase/firebase-functions';
import { useEffect, useState } from 'react';
import Event from '../interfaces/Event';

import { db } from '../utils/firebase/firebase-functions';
import { collection, getDocs } from 'firebase/firestore';

// TODO: Remove this function
async function getAllDocsFromSubcollection() {
  const collRef = collection(db, 'users', 'HH5@headhunt.com.sg', 'Event2');
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
