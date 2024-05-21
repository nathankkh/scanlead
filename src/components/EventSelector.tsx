import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';

import { getAllDocs } from '../utils/firebase/firebase-functions';
import { useEffect, useState, useContext } from 'react';
import Event from '../interfaces/Event';
import EventContext from '../utils/EventContext';

export default function EventSelector() {
  const [events, setEvents] = useState<Event[]>([]);
  const { currentEvent, setCurrentEvent } = useContext(EventContext);

  // Populates events array with all existing events
  useEffect(() => {
    getAllDocs('events').then((docs) => {
      setEvents(docs);
    });
  }, []);

  return (
    <>
      <Dropdown>
        <MenuButton
          size="lg"
          endDecorator={<ArrowDropDown />}
          variant={'plain'}
          sx={{
            fontSize: '1.3em',
            fontWeight: 'normal'
          }}
        >
          {currentEvent?.Name || 'Select event'}
        </MenuButton>
        <Menu>
          {events
            .sort((b, a) => a.Date - b.Date)
            .map((event: Event, index) => (
              <MenuItem key={index} onClick={() => setCurrentEvent(event)}>
                {event.Name}
              </MenuItem>
            ))}
        </Menu>
      </Dropdown>
    </>
  );
}
