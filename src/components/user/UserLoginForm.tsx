import { loginEmailPassword } from '../../firebase-setup/firebase-functions';
import { useState } from 'react';

export default function UserLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin() {
    loginEmailPassword(email, password)
      .then(() => setErrorMessage(''))
      .catch((error) => setErrorMessage(error.message));
  }

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
        <br />
        <button type="button" onClick={handleLogin}>
          Login
        </button>
        <p>{errorMessage}</p>
      </form>
    </div>
  );
}
