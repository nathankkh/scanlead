import { Button, Stack } from '@mui/joy';
import { getAllDocs } from '../utils/firebase/firebase-functions';
import { useEffect, useState } from 'react';

interface Event {
  Name: string;
  Date: number;
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
      {events.map((event) => (
        <Button variant="plain">{event.Name}</Button>
      ))}
      <Button onClick={() => console.log(events)}>Confirm</Button>
    </Stack>
  );
}
