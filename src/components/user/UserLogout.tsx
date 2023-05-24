import { logout } from "../../firebase-setup/firebase-functions";

export default function UserLogout() {
    return (
        <div>
            <button onClick={logout}>Logout</button>
        </div>
    );
}