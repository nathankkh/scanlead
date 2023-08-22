import './App.css';
import Logo from './components/Logo';
import UserContainer from './components/user/UserContainer';
import TabSelector from './components/leads/TabSelector';
import AuthContext from './utils/AuthContext';

import { useState } from 'react';

import { CssVarsProvider } from '@mui/joy/styles';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUser, setShowUser] = useState(true); // used to hide user details when scanning QR code

  return (
    <CssVarsProvider>
      <AuthContext.Provider value={{ isLoggedIn }}>
        <>
          <Logo />
          <UserContainer setIsLoggedIn={setIsLoggedIn} showUser={showUser} />

          {isLoggedIn && <hr />}

          {isLoggedIn && <TabSelector setShowUser={setShowUser} />}
        </>
      </AuthContext.Provider>
    </CssVarsProvider>
  );
}

export default App;
