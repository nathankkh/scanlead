import UserLoginForm from './UserLoginForm';
import UserLogout from './UserLogout';
import { useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-setup/firebase-functions';
import AuthContext from '../../AuthContext';

export default function UserContainer({ setIsLoggedIn }) {
  const { isLoggedIn } = useContext(AuthContext);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsLoggedIn(true);
      console.log('user is signed in');
    } else {
      setIsLoggedIn(false);
      console.log('user is not signed in');
    }
  });

  return (
    <>
      {isLoggedIn ? <UserLogout /> : <UserLoginForm />}
      <div>{isLoggedIn ? <p>Logged in as {auth.currentUser?.email}</p> : null}</div>
    </>
  );
}
