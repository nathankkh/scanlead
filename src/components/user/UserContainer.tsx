import UserLoginForm from './UserLoginForm';
import UserLogout from './UserLogout';
import { useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../utils/firebase/firebase-functions';
import AuthContext from '../../utils/AuthContext';

import Grid from '@mui/joy/Grid';
import Typography from '@mui/joy/Typography';

export default function UserContainer({ setIsLoggedIn, showUser }) {
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
    'HH4',
    'SUSSSHBS'
  ];

  function displayUser(email) {
    const user = email.split('@')[0];
    const res = users.find((name) => name.toLowerCase() == user);
    return res ? res : user;
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
      {isLoggedIn && showUser && (
        <Grid
          container
          alignItems={'center'}
          justifyContent={'space-between'}
          sx={{ paddingTop: '1rem' }}
        >
          <Grid>
            <Typography>
              Logged in as <strong>{displayUser(auth.currentUser?.email)}</strong>
            </Typography>
          </Grid>
          <Grid>
            <UserLogout />
          </Grid>
          {/* <input ref={valueRef}></input> //TODO: DELETE ME
          <button onClick={() => testUploadLead(valueRef.current?.value)}> test</button> //TODO:
          DELETE ME */}
        </Grid>
      )}

      {!isLoggedIn && <UserLoginForm />}
    </>
  );
}
