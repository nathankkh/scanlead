import Typography from '@mui/joy/Typography';
import PgFairLogo from '../assets/PgFairLogo.svg';

export default function Logo() {
  return (
    <>
      <img
        id="HHLogo"
        /* src="https://i0.wp.com/headhunt.com.sg/wp-content/uploads/2019/08/Headhunt-Logo_Site-Icon.png?fit=512%2C513&ssl=1" */
        src={PgFairLogo}
      />
      <Typography level="h3">PG Fair 2024</Typography>
    </>
  );
}
