import './styles/App.css';
import AuthContext from './utils/AuthContext';
import EventContext from './utils/EventContext';
import Header from './components/Header.tsx';
import UserContainer from './components/user/UserContainer';
import TabSelector from './components/leads/TabSelector';
import joyTheme from './styles/joyTheme.tsx';

import PgEvent from './interfaces/PgEvent.ts';
import { useState } from 'react';

import { CssVarsProvider } from '@mui/joy/styles';

const PG_FAIR_2025: PgEvent = {
  Name: 'PG Fair 2025 (Jan)',
  Date: new Date('2025-01-18'),
  id: '1075461396989'
};

function App() {
  // used for context hooks
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [event, setEvent] = useState(PG_FAIR_2025); // default event
  // end context

  const [showUser, setShowUser] = useState(true); // used to hide user details when scanning QR code

  return (
    <CssVarsProvider theme={joyTheme}>
      <AuthContext.Provider value={{ isLoggedIn }}>
        <EventContext.Provider value={{ currentEvent: event, setCurrentEvent: setEvent }}>
          <>
            <Header />
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
