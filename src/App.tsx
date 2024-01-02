import './App.css';
import AuthContext from './utils/AuthContext';
import EventContext from './utils/EventContext';
import Logo from './components/Logo';
import UserContainer from './components/user/UserContainer';
import TabSelector from './components/leads/TabSelector';
import EventSelector from './components/EventSelector';

import { useState } from 'react';

import { CssVarsProvider } from '@mui/joy/styles';

function App() {
  // used for context hooks
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [event, setEvent] = useState(null);
  // end context hooks
  const [showUser, setShowUser] = useState(true); // used to hide user details when scanning QR code

  return (
    <CssVarsProvider>
      <AuthContext.Provider value={{ isLoggedIn }}>
        <EventContext.Provider value={{ event, setEvent }}>
          <>
            <Logo />
            <EventSelector /> {/* TODO: Make this event dependent */}
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
