import './App.css';
import Logo from './components/Logo';
import UserContainer from './components/user/UserContainer';
import TabSelector from './components/leads/TabSelector';
import AuthContext from './AuthContext';
import { useState } from 'react';

import { CssVarsProvider } from '@mui/joy/styles';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <CssVarsProvider>
      <AuthContext.Provider value={{ isLoggedIn }}>
        <>
          <Logo />
          <UserContainer setIsLoggedIn={setIsLoggedIn} />
          <hr />
          {isLoggedIn && <TabSelector />}
        </>
      </AuthContext.Provider>
    </CssVarsProvider>
  );
}

export default App;
