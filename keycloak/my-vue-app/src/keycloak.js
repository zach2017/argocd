import Keycloak from 'keycloak-js';

// Singleton Keycloak instance
const keycloak = new Keycloak({
  url: 'http://localhost:7777',
  realm: 'demorealm',
  clientId: 'demoapp',
});

// Flag to track if initialization has occurred
let isInitialized = false;

export const initKeycloak = async () => {
  if (!isInitialized) {
    try {
      await keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
      });
      isInitialized = true;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      throw error; // Let the caller handle the error
    }
  }
  return keycloak;
};

export default keycloak;