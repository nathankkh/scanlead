import { createContext, Dispatch, SetStateAction } from 'react';
import PgEvent from '../interfaces/PgEvent.ts';

interface EventContextProps {
  currentEvent: PgEvent | null;
  setCurrentEvent: Dispatch<SetStateAction<PgEvent>>;
}

const defaultSetEvent: Dispatch<SetStateAction<PgEvent>> = () => {
  0;
};

const EventContext = createContext<EventContextProps>({
  currentEvent: null,
  setCurrentEvent: defaultSetEvent
});

export default EventContext;
