import { useEffect, useState } from 'react';
import { initKeycloak } from './keycloak';

function App() {
  const [authenticated, setAuthenticated] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    console.log('useEffect: Starting Keycloak initialization');

    initKeycloak()
      .then((keycloak) => {
        console.log('Keycloak initialized, auth status:', keycloak.authenticated);
        setAuthenticated(keycloak.authenticated);
        if (keycloak.authenticated) {
          console.log('User authenticated, username:', keycloak.tokenParsed?.preferred_username);
          setUserName(keycloak.tokenParsed?.preferred_username || 'User');
        } else {
          console.log('Not authenticated after init');
        }
      })
      .catch((err) => {
        console.error('Keycloak init error:', err);
        setAuthenticated(false);
      });
  }, []); // Runs once on mount

  const handleLogout = async () => {
    const keycloak = await initKeycloak();
    keycloak.logout({ redirectUri: 'http://localhost:5173' });
  };

  console.log('Render: authenticated state=', authenticated);

  if (authenticated === null) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!authenticated) {
    return <div style={{ padding: '20px' }}>Authentication failed. Please try again.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome, {userName}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default App;