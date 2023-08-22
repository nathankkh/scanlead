import { logout } from '../../firebase-setup/firebase-functions';
import Button from '@mui/joy/Button/Button';

export default function UserLogout() {
  return (
    <div>
      <Button variant="outlined" onClick={logout} color="neutral">
        Logout
      </Button>
    </div>
  );
}
