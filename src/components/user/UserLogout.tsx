import { logout } from '../../utils/firebase/firebase-functions';
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
