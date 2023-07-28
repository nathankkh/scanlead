import UserLoginForm from './UserLoginForm';
import UserLogout from './UserLogout';
import { useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-setup/firebase-functions';
import { useRef } from 'react';
import AuthContext from '../../AuthContext';
import config from '../../../config';
import { lookupValue, submitLead } from '../../firebase-setup/firebase-functions'; //TODO: DELETE ME

import Grid from '@mui/joy/Grid';

export default function UserContainer({ setIsLoggedIn }) {
  const { isLoggedIn } = useContext(AuthContext);
  const valueRef = useRef<HTMLInputElement>(null);

  async function testUploadLead(id) { //TODO: DELETE ME
    let attendee = (await lookupValue(id, config.lookupCollection, config.lookupField))[0];
    let docName = 'hh4@headhunt.com.sg_' + attendee.id;
    attendee['timestamp'] = Date.now();
    try {

      submitLead(attendee, docName).then(() => {
        console.log('Lead submitted!');
      })
    } catch (err) {
      alert(err);
    }
  }

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
      {isLoggedIn && <Grid container alignItems={'center'} justifyContent={'space-between'} sx={{ paddingTop: '1rem' }}>

        <Grid>
          Logged in as <strong>{displayUser(auth.currentUser?.email)}</strong>
        </Grid>

        <Grid>
          <UserLogout />
        </Grid>

        <input ref={valueRef} ></input> //TODO: DELETE ME
        <button onClick={() => testUploadLead(valueRef.current?.value)}> test</button> //TODO: DELETE ME

      </Grid>
      }

      {
        !isLoggedIn && (
          <UserLoginForm />
        )
      }
    </>
  );
}
