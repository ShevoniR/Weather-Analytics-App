import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Logout() {
  const { logout, isLoading } = useAuth0();

  const handleLogout = () => {
    if (isLoading) return;
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <button type="button" onClick={handleLogout}>
      Log Out
    </button>
  );
}

export default Logout;

