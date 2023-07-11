/* import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg'; */
import './App.css';
import Logo from './components/Logo';
import UserContainer from './components/user/UserContainer';
import LeadsContainer from './components/leads/LeadsContainer';
import AuthContext from './AuthContext';
import { useState } from 'react';
import TestModal from './components/TestModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn }}>
      <>
        <Logo />
        <UserContainer setIsLoggedIn={setIsLoggedIn} />
        <hr />
        {isLoggedIn && <LeadsContainer />}
        <TestModal />
      </>
    </AuthContext.Provider>
  );
}

export default App;
