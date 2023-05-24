import { loginEmailPassword } from "../../firebase-setup/firebase-functions";
import { useState } from "react";

export default function UserLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div>
            <form>
                <input
                    className='usernameInput'
                    placeholder='Enter Username'
                    onChange={e => setEmail(e.target.value)}>
                </input>
                <input
                    className='passwordInput'
                    placeholder='Enter Password'
                    onChange={e => setPassword(e.target.value)}
                    type='password'>
                </input>
                <button type='button' onClick={() => loginEmailPassword(email, password)}>Login</button>
            </form>
        </div>
    );
}