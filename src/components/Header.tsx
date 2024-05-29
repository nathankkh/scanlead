import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import PgFairLogo from '../assets/PgFairLogo.svg';
import { useContext } from 'react';
import AuthContext from '../utils/AuthContext';
import EventSelector from './EventSelector.tsx';

export default function Header() {
  /* const { event } = useContext(EventContext); */
  const { isLoggedIn } = useContext(AuthContext);
  return (
    <>
      <Stack direction="column" alignItems="center" spacing={0}>
        <img
          id="HHLogo"
          /* src="https://i0.wp.com/headhunt.com.sg/wp-content/uploads/2019/08/Headhunt-Logo_Site-Icon.png?fit=512%2C513&ssl=1" */
          src={PgFairLogo}
        />
        {!isLoggedIn && <Typography fontSize={'x-large'}>PG Fair</Typography>}
        {isLoggedIn && <EventSelector />}
      </Stack>
    </>
  );
}
