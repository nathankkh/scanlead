import { ListItemButton, Stack } from '@mui/joy';
// import { getAllDocs } from '../utils/firebase/firebase-functions';
// import { useEffect } from 'react';

export default function EventSelector() {
  // const events = getAllDocs('events');
  // select event, then click confirm
  return (
    <Stack>
      hello
      <ListItemButton>Event 1</ListItemButton>
      <ListItemButton>Event 2</ListItemButton>
      <ListItemButton>Event 3</ListItemButton>
    </Stack>
  );
}
