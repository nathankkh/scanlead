import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import PgFairLogo from '../assets/PgFairLogo.svg';

export default function Header() {
  return (
    <>
      <Stack direction="column" alignItems="center" spacing={0}>
        <img
          id="HHLogo"
          /* src="https://i0.wp.com/headhunt.com.sg/wp-content/uploads/2019/08/Headhunt-Logo_Site-Icon.png?fit=512%2C513&ssl=1" */
          src={PgFairLogo}
        />
        <Typography fontSize={'x-large'}>PG Fair 2024</Typography>
      </Stack>
    </>
  );
}
