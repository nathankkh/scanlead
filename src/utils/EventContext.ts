import { createContext, Dispatch, SetStateAction } from 'react';
import Event from '../interfaces/Event';

interface EventContextProps {
  event: Event | null;
  setEvent: Dispatch<SetStateAction<Event>>;
}

const defaultSetEvent: Dispatch<SetStateAction<Event>> = () => {
  0;
};

const EventContext = createContext<EventContextProps>({
  event: null,
  setEvent: defaultSetEvent
});

export default EventContext;
