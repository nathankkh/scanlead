import { createContext, Dispatch, SetStateAction } from 'react';

interface EventContextProps {
  event: string | null;
  setEvent: Dispatch<SetStateAction<string | null>>;
}

const defaultSetEvent: Dispatch<SetStateAction<string | null>> = () => {
  0;
};

const EventContext = createContext<EventContextProps>({
  event: null,
  setEvent: defaultSetEvent
});

export default EventContext;
