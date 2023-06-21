import { createContext } from 'react';

interface AuthContextProps {
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false
});

export default AuthContext;
