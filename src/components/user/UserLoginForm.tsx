import { loginEmailPassword } from '../../firebase-setup/firebase-functions';
import { useState } from 'react';

export default function UserLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      <form>
        <input
          className="input"
          id="emailInput"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <input
          className="input"
          id="passwordInput"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        ></input>
        <button
          type="button"
          onClick={() => loginEmailPassword(email, password)}
        >
          Login
        </button>
        {/* TODO: Add Error message */}
      </form>
    </div>
  );
}
