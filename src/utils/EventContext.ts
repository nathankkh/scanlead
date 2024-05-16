import { createContext, Dispatch, SetStateAction } from 'react';
import Event from '../interfaces/Event';

interface EventContextProps {
  currentEvent: Event | null;
  setCurrentEvent: Dispatch<SetStateAction<Event>>;
}

const defaultSetEvent: Dispatch<SetStateAction<Event>> = () => {
  0;
};

const EventContext = createContext<EventContextProps>({
  currentEvent: null,
  setCurrentEvent: defaultSetEvent
});

export default EventContext;
