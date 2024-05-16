import './App.css';
import AuthContext from './utils/AuthContext';
import EventContext from './utils/EventContext';
import Logo from './components/Logo';
import UserContainer from './components/user/UserContainer';
import TabSelector from './components/leads/TabSelector';
/*import EventSelector from './components/EventSelector';*/

import Event from './interfaces/Event';
import { useState } from 'react';

import { CssVarsProvider } from '@mui/joy/styles';

const PG_FAIR_2024_JAN: Event = {
  Name: 'PG Fair 2024 (Jan)',
  Date: new Date('2024-01-13'),
  id: '741341922647'
};

function App() {
  // used for context hooks
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [event, setEvent] = useState(PG_FAIR_2024_JAN); // Stored as the event ID. Modify this to be an object
  // end context
  const [showUser, setShowUser] = useState(true); // used to hide user details when scanning QR code

  return (
    <CssVarsProvider>
      <AuthContext.Provider value={{ isLoggedIn }}>
        <EventContext.Provider value={{ currentEvent: event, setCurrentEvent: setEvent }}>
          <>
            <Logo />
            {/*<EventSelector />*/}
            <UserContainer setIsLoggedIn={setIsLoggedIn} showUser={showUser} />
            {isLoggedIn && <hr />}
            {isLoggedIn && <TabSelector setShowUser={setShowUser} />}
          </>
        </EventContext.Provider>
      </AuthContext.Provider>
    </CssVarsProvider>
  );
}

export default App;
