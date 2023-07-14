import UserLoginForm from './UserLoginForm';
import UserLogout from './UserLogout';
import { useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-setup/firebase-functions';
import AuthContext from '../../AuthContext';

export default function UserContainer({ setIsLoggedIn }) {
  const { isLoggedIn } = useContext(AuthContext);

  const users = [
    'Aalto',
    'Amity',
    'ASB',
    'Aventis',
    'CPA',
    'Curtin',
    'DigiPen',
    'EAIM',
    'EDUSA',
    'EDHEC',
    'ESSEC',
    'HKU',
    'IE',
    'IMDA',
    'INSEAD',
    'JCU',
    'Kaplan',
    'LSBF',
    'MDIS',
    'Manchester',
    'NBS',
    'PACE',
    'NCPA',
    'NTUEA',
    'SCSE',
    'SPMS',
    'SSS',
    'NIE',
    'RSIS',
    'SCALE',
    'NUSMBA',
    'ISS',
    'FASS',
    'LKYSPP',
    'Duke',
    'Newcastle',
    'OCBC',
    'POSB',
    'PSB',
    'Rutgers',
    'SPJain',
    'SIM',
    'SIT',
    'LKCSB',
    'SOA',
    'SOE',
    'SCIS',
    'YPHSL',
    'SMUPhD',
    'NSHD',
    'SUSSBIZ',
    'SUSSNSHD',
    'SUSSSLAW',
    'SUSSSST',
    'SUSSOGS',
    'IAL',
    'SUTD',
    'NUSMSC',
    'HH1',
    'HH2',
    'HH3',
    'HH4'
  ];

  function displayUser(email) {
    return users.find((name) => name.toLowerCase() == email.split('@')[0]);
  }

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
      <div>{isLoggedIn ? <p>Logged in as {displayUser(auth.currentUser?.email)}</p> : null}</div>
    </>
  );
}
