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
  const users = {
    aalto: 'Aalto',
    amity: 'Amity',
    asb: 'ASB',
    aventis: 'Aventis',
    cpa: 'CPA',
    curtin: 'Curtin',
    digipen: 'DigiPen',
    eaim: 'EAIM',
    edusa: 'EDUSA',
    edhec: 'EDHEC',
    essec: 'ESSEC',
    hku: 'HKU',
    ie: 'IE',
    imda: 'IMDA',
    insead: 'INSEAD',
    jcu: 'JCU',
    kaplan: 'Kaplan',
    lsbf: 'LSBF',
    mdis: 'MDIS',
    manchester: 'Manchester',
    nbs: 'NBS',
    pace: 'PaCE',
    ncpa: 'NCPA',
    ntuea: 'NTUEA',
    scse: 'SCSE',
    spms: 'SPMS',
    sss: 'SSS',
    nie: 'NIE',
    rsis: 'RSIS',
    scale: 'SCALE',
    nusmba: 'NUSMBA',
    iss: 'ISS',
    fass: 'FASS',
    lkyspp: 'LKYSPP',
    duke: 'Duke',
    newcastle: 'Newcastle',
    ocbc: 'OCBC',
    posb: 'POSB',
    psb: 'PSB',
    rutgers: 'Rutgers',
    spjain: 'SP Jain',
    sim: 'SIM',
    sit: 'SIT',
    lkcsb: 'LKCSB',
    soa: 'SOA',
    soe: 'SOE',
    scis: 'SCIS',
    yphsl: 'YPHSL',
    smuphd: 'SMUPhD',
    nshd: 'NSHD',
    sussbiz: 'SUSS BIZ',
    sussnshd: 'SUSS NSHD',
    sussslaw: 'SUSS SLAW',
    susssst: 'SUSS SST',
    sussogs: 'SUSS OGS',
    ial: 'IAL',
    sutd: 'SUTD',
    nusmsc: 'NUS MSc',
    hh1: 'HH1',
    hh2: 'HH2',
    hh3: 'HH3',
    hh4: 'HH4',
    sussshbs: 'SUSS SHBS',
    sussshbs1: 'SUSS SHBS',
    smusoss: 'SMU SOSS',
    upgrad: 'upGrad',
    tmc: 'TMC',
    hkust: 'HKUST',
    cae: 'CAE',
    scalece: 'SCALE CE',
    lkysppce: 'LKYSPP CE',
    nusbizce: 'NUS BIZ CE',
    nusissce: 'NUS ISS CE',
    nbsce: 'NBS CE',
    sssce: 'SSS CE',
    pacece: 'PaCE CE',
    niece: 'NIE CE',
    eace: 'EA CE',
    smuce: 'SMU CE',
    sutdce: 'SUTD CE',
    sitce: 'SIT CE',
    sussce: 'SUSS CE',
    ntuccds: 'NTU CCDS',
    smuac: 'SMU Acad',
    smued: 'SMU ED',
    tspp: 'TSPP'
  };

  function displayUser(email) {
    const user = email.split('@')[0].toLowerCase();
    return users[user] || user;
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
        </Grid>
      )}

      {!isLoggedIn && <UserLoginForm />}
    </>
  );
}
