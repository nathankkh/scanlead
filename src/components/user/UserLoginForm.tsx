import { loginEmailPassword } from '../../firebase-setup/firebase-functions';
import { useState } from 'react';
import FormControl from '@mui/joy/FormControl';
import FormLabel, { formLabelClasses } from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import { Button } from '@mui/joy';

export default function UserLoginForm() {
  const [errorMessage, setErrorMessage] = useState('');

  function validateEmail(email) {
    if (!email.includes('@')) {
      email = email.concat('@headhunt.com.sg');
    }
    return email;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    const formData = new FormData(e.target);
    const email = validateEmail(formData.get('username'));
    const password = formData.get('password');
    loginEmailPassword(email, password)
      .then(() => setErrorMessage(''))
      .catch((error) => setErrorMessage(error.message));
  }
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1
        }}
      >
        <Typography level="body2">Sign in to continue</Typography>
      </Box>
      <Box
        sx={{
          my: 'auto',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          width: 400,
          maxWidth: '100%',
          mx: 'auto',
          borderRadius: 'sm',
          '& form': {
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          },
          [`& .${formLabelClasses.asterisk}`]: {
            visibility: 'hidden'
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <FormControl required>
            <FormLabel>Email</FormLabel>
            <Input
              // html input attribute
              name="username"
              placeholder="Enter username"
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Password</FormLabel>
            <Input name="password" type="password" placeholder="Enter password" />
          </FormControl>
          {errorMessage && <Typography color="danger">{errorMessage}</Typography>}
          <Button type="submit">Sign in</Button>
        </form>
      </Box>
    </>
  );
}
