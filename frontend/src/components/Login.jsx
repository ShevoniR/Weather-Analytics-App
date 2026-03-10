import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Login() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    if (isLoading) return;
    loginWithRedirect();
  };

  return (
    <button type="button" onClick={handleLogin}>
      Log In
    </button>
  );
}

export default Login;

