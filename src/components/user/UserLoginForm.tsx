import { loginEmailPassword } from '../../firebase-setup/firebase-functions';
import { useState, useRef } from 'react';

export default function UserLoginForm() {
  const [errorMessage, setErrorMessage] = useState('');
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  function validateEmail() {
    let email = userRef.current?.value ?? '';
    if (!email.includes('@')) {
      email = email.concat('@headhunt.com.sg');
    }
    return email;
  }

  async function handleLogin() {
    const email = validateEmail();
    const password = passRef.current?.value;
    console.log(email);
    loginEmailPassword(email, password)
      .then(() => setErrorMessage(''))
      .catch((error) => setErrorMessage(error.message));
  }

  return (
    <div>
      <form>
        <input className="input" id="emailInput" placeholder="Enter Username" ref={userRef}></input>
        <br />
        <input
          className="input"
          id="passwordInput"
          placeholder="Enter Password"
          ref={passRef}
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
