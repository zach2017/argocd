Keycloak 

Here's a simple, step-by-step guide to setting up Keycloak locally using Docker. I’ll explain each step clearly so you can follow along easily.

## quick start Docker

- docker pull quay.io/keycloak/keycloak:latest
- docker run -p 7777:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev

npm create remix@latest --template remix-run/remix-vite-template remix-vite-keycloak-app

npm install dotenv # Still useful for loading .env for the server process

# .env file
```
# Keycloak Configuration (Server-Side Access Only)
KEYCLOAK_URL="http://localhost:8080"
KEYCLOAK_REALM="myrealm"
KEYCLOAK_CLIENT_ID="remix-app"
KEYCLOAK_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE" # NO VITE_ prefix! Secret.

# Application Configuration (Server-Side Access Only for this flow)
APP_BASE_URL="http://localhost:3000" # Primarily needed server-side for redirect URIs

# Remix Session Configuration (Server-Side Secret)
SESSION_SECRET="SOME_SUPER_SECRET_STRING_FOR_SESSION_ENCRYPTION" # NO VITE_ prefix! Secret.
```
You're right - Keycloak has deprecated the older initialization method. Let me update the code to use the current recommended initialization process for Keycloak-js.

Thanks for pointing that out! You're absolutely right. I've updated the login component to use the current recommended initialization process for Keycloak-js. Here are the key changes I made:

1. **Async/Await Pattern**: Replaced the Promise chain with a more modern async/await pattern for better readability and error handling.

2. **PKCE Authentication Flow**: Added `pkceMethod: 'S256'` to enable Proof Key for Code Exchange (PKCE), which is now recommended for better security with OAuth 2.0 authorization code flow.

3. **Token Refresh Handling**: Added an `onTokenExpired` handler to automatically refresh tokens when they expire, which helps maintain the user session.

4. **Improved Error Handling**: Enhanced the error handling to properly convert non-Error objects to Error objects for consistent error handling.

These changes align with Keycloak's current best practices. The component now uses the modern initialization process while maintaining all the functionality of displaying user roles and email attributes.

Is there anything else you'd like me to update or explain about the Keycloak integration?
```

```typescript
// src/main.tsx - Main React application entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/App.tsx - App component utilizing the Keycloak login
import React from 'react';
import KeycloakLogin from './components/KeycloakLogin';

interface UserInfo {
  email: string;
  roles: string[];
  username: string;
  isAuthenticated: boolean;
}

const App: React.FC = () => {
  const handleLogin = (userInfo: UserInfo) => {
    console.log('User logged in:', userInfo);
    // You can store user info in context or state management
  };

  const handleError = (error: Error) => {
    console.error('Authentication error:', error);
    // Handle authentication errors
  };

  return (
    <div className="app-container p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Keycloak Application</h1>
      <KeycloakLogin onLogin={handleLogin} onError={handleError} />
    </div>
  );
};

export default App;

// public/silent-check-sso.html - Required for silent SSO support
<!DOCTYPE html>
<html>
<head>
  <script>
    parent.postMessage(location.href, location.origin);
  </script>
</head>
<body>
  <!-- Silent SSO check page -->
</body>
</html>

// .env file for Keycloak configuration
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=myrealm
VITE_KEYCLOAK_CLIENT_ID=myclient

```

## How to Configure Roles and Email Attributes in Keycloak

Once you've implemented the login component, you'll need to configure your Keycloak server to manage user roles and email attributes. Here's how to do it:

### Setting Up Roles

1. **Create Roles in Keycloak:**
   - Log in to the Keycloak Admin Console
   - Select your realm (e.g., "myrealm")
   - Go to "Roles" in the left sidebar
   - Click "Add Role" and create roles like "user", "admin", "manager", etc.

2. **Assign Roles to Users:**
   - Go to "Users" in the left sidebar
   - Find and select the user you want to modify
   - Go to the "Role Mappings" tab
   - Add the appropriate roles to the user from the "Available Roles" list

3. **Configure Client-Specific Roles (Optional):**
   - If you need client-specific roles, go to "Clients" in the sidebar
   - Select your client (e.g., "myclient")
   - Go to the "Roles" tab and create client-specific roles
   - Assign these roles to users through the user's "Role Mappings" page

### Configuring Email Attributes

1. **Ensure Email is Required:**
   - In the Keycloak Admin Console, go to "Authentication"
   - Click on "Flows" tab
   - Select "Registration" flow
   - Make sure "Registration User Creation" has "Email as username" enabled if you want to use email as the username

2. **Configure User Attributes:**
   - Go to "Users" and select a user
   - In the "Attributes" tab, you can add custom attributes
   - For email verification, go to the "Details" tab and ensure the email is verified

3. **Configure SMTP for Email Verification:**
   - Go to "Realm Settings" > "Email"
   - Configure your SMTP server settings to enable email verification
   - This allows Keycloak to send verification emails when users register

### Client Configuration for Proper Token Claims

The component I provided accesses role information from the JWT token. To ensure roles are included in the token:

1. **Configure Client Scope:**
   - Go to "Clients" > Your client > "Client Scopes"
   - Ensure that the "roles" scope is included in the client's scopes
   - Click on the "roles" scope and verify "realm_access.roles" is mapped

2. **Protocol Mappers:**
   - Go to "Clients" > Your client > "Mappers"
   - Ensure you have a mapper for "realm roles" that maps to "realm_access.roles"
   - Add an email mapper if not present: 
     - Create a new mapper
     - Type: "User Property"
     - Property: "email"
     - Token Claim Name: "email"
     - Claim JSON Type: "String"

### Testing the Integration

1. After setting up roles and email attributes in Keycloak, run your Vite.js application
2. Click the login button to authenticate with Keycloak
3. Upon successful authentication, the component will display:
   - Username
   - Email address
   - Assigned roles

### Security Best Practices

1. **Role-Based Access Control (RBAC):**
   ```typescript
   // Example function to check if a user has a specific role
   const hasRole = (requiredRole: string): boolean => {
     return userInfo?.roles.includes(requiredRole) || false;
   };
   
   // Usage in a protected component
   if (hasRole('admin')) {
     // Show admin-only content
   }
   ```

2. **Token Validation:**
   - Always validate tokens on your backend API
   - Check token expiration before processing requests
   - Verify token signatures using Keycloak's public key

3. **Enable SSL/TLS** in production for both your application and Keycloak server

Let me know if you need any clarification or want to modify any part of the implementation!

I'll create a TypeScript-based Remix ViteJS login component using Keycloak-js and then explain how to configure roles and email attributes.

Here's the login component:

```typescript
import { useEffect, useState } from 'react';
import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { useNavigate } from '@remix-run/react';

// Keycloak configuration
const keycloakConfig = {
  url: 'http://localhost:8080/auth', // Your Keycloak server URL
  realm: 'my-realm',
  clientId: 'my-remix-app',
};

const keycloak = new Keycloak(keycloakConfig);

export default function Login() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();

  const initOptions: KeycloakInitOptions = {
    onLoad: 'login-required',
    checkLoginIframe: false,
  };

  useEffect(() => {
    keycloak
      .init(initOptions)
      .then((auth) => {
        setAuthenticated(auth);
        if (auth) {
          // Load user profile
          keycloak.loadUserInfo().then((user) => {
            setUserInfo(user);
            // Store tokens in session storage or secure cookie
            sessionStorage.setItem('token', keycloak.token || '');
            sessionStorage.setItem('refreshToken', keycloak.refreshToken || '');
          });
        }
      })
      .catch((error) => {
        console.error('Keycloak init failed:', error);
      });

    // Token refresh handling
    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            sessionStorage.setItem('token', keycloak.token || '');
            sessionStorage.setItem('refreshToken', keycloak.refreshToken || '');
          }
        })
        .catch(() => console.error('Token refresh failed'));
    };
  }, []);

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
    sessionStorage.clear();
  };

  const hasRole = (role: string) => {
    return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role);
  };

  if (!authenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-container">
      <h1>Welcome {userInfo?.name || userInfo?.preferred_username}</h1>
      <p>Email: {userInfo?.email}</p>
      
      {/* Role-based content */}
      {hasRole('admin') && (
        <div>
          <h2>Admin Section</h2>
          <p>You have admin privileges</p>
        </div>
      )}
      
      {hasRole('user') && (
        <div>
          <h2>User Section</h2>
          <p>Standard user content</p>
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

To use this component, you'll need to install the required dependencies:
```bash
npm install keycloak-js @remix-run/react
```

Here's how to configure Keycloak and set up roles and email attributes:

1. **Keycloak Server Setup**:
- Download and install Keycloak (https://www.keycloak.org/downloads)
- Start the server: `bin/kc.sh start-dev` (development mode)
- Access admin console at `http://localhost:8080`
- Default admin credentials: admin/admin

2. **Realm and Client Configuration**:
- Create a new realm (e.g., 'my-realm')
- Create a new client:
  - Client ID: 'my-remix-app'
  - Client Protocol: openid-connect
  - Access Type: public
  - Valid Redirect URIs: http://localhost:5173/*
  - Web Origins: http://localhost:5173

3. **Configuring Roles**:
- In Keycloak Admin Console:
  - Go to 'Roles' → 'Realm Roles'
  - Create roles like 'admin' and 'user'
  - Go to 'Clients' → 'my-remix-app' → 'Client Scopes' → 'my-remix-app-dedicated'
  - Ensure 'roles' is mapped under 'Mappers'
- Assign roles to users:
  - Go to 'Users' → Select a user → 'Role Mappings'
  - Assign desired realm roles (admin, user, etc.)

4. **Email Attribute Configuration**:
- Enable email in client scope:
  - Go to 'Clients' → 'my-remix-app' → 'Client Scopes' → 'my-remix-app-dedicated'
  - Add mapper: 
    - Name: email
    - Mapper Type: User Property
    - Property: email
    - Token Claim Name: email
    - Add to ID token: ON
    - Add to access token: ON
- Set user email:
  - Go to 'Users' → Select a user → 'Attributes'
  - Add email attribute or fill in the email field in user details

5. **Usage in Remix**:
- Place the Login component in your routes (e.g., `app/routes/login.tsx`)
- Update the `keycloakConfig` with your actual Keycloak server details
- Access protected routes using the token from sessionStorage
- Check roles using the `hasRole` function

The component will:
- Automatically redirect to Keycloak login if not authenticated
- Display user info including email
- Show content based on user roles
- Handle token refresh automatically
- Provide logout functionality

Security notes:
- In production, use HTTPS
- Consider using secure cookies instead of sessionStorage
- Adjust token refresh interval based on your needs
- Add error boundaries and loading states as needed
- 
### Step 1: Install Docker
- **What it does**: Docker lets you run Keycloak in a container, which is like a lightweight virtual machine.
- **How to do it**: 
  - If you don’t have Docker installed, download and install it from [docker.com](https://www.docker.com/get-started/). Choose the version for youra your operating system (Windows, macOS, or Linux).
  - After installation, open a terminal (e.g., Command Prompt on Windows, Terminal on macOS/Linux) and run `docker --version` to confirm it’s working. You should see a version number like "20.10.12".

### Step 2: Pull the Keycloak Docker Image
- **What it does**: Downloads the official Keycloak software from the internet so you can run it.
- **How to do it**: 
  - In your terminal, type:  
    ```
    docker pull quay.io/keycloak/keycloak:latest
    ```
  - Press Enter. This fetches the latest Keycloak image from Quay.io, a container registry. You’ll see download progress. When it’s done, the terminal will return to a prompt.

### Step 3: Run Keycloak in a Docker Container
- **What it does**: Starts Keycloak on your computer inside a Docker container.
- **How to do it**: 
  - In the terminal, run this command:  
    ```
    docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
    ```
  - Explanation of the parts:
    - `docker run`: Tells Docker to start a container.
    - `-p 8080:8080`: Maps port 8080 on your computer to port 8080 in the container so you can access Keycloak in a browser.
    - `-e KEYCLOAK_ADMIN=admin`: Sets the admin username to "admin".
    - `-e KEYCLOAK_ADMIN_PASSWORD=admin`: Sets the admin password to "admin" (you can change these later).
    - `quay.io/keycloak/keycloak:latest`: Specifies the Keycloak image you downloaded.
    - `start-dev`: Runs Keycloak in development mode (simpler for testing).
  - After running, you’ll see logs in the terminal as Keycloak starts up. Wait until you see a message like "Started Server" or "Running".

### Step 4: Access Keycloak in Your Browser
- **What it does**: Lets you log in and use Keycloak through a web interface.
- **How to do it**: 
  - Open your web browser (e.g., Chrome, Firefox).
  - Go to: `http://localhost:8080`.
  - You’ll see the Keycloak welcome page. Click "Administration Console".
  - Log in with:
    - Username: `admin`
    - Password: `admin`
  - You’re now in the Keycloak admin dashboard!

### Step 5: Test It Out
- **What it does**: Confirms everything is working by creating a sample realm (a Keycloak workspace).
- **How to do it**: 
  - In the admin console, hover over "Master" (top left) and click "Create Realm".
  - Enter a name like "my-realm" and click "Create".
  - You’ll see "my-realm" in the dropdown. You’ve set up Keycloak successfully!

### Step 6: Stop Keycloak
- **What it does**: Shuts down the container when you’re done.
- **How to do it**: 
  - In the terminal where Keycloak is running, press `Ctrl + C`. This stops the container.
  - To restart later, just repeat Step 3.

That’s it! You’ve got Keycloak running locally with Docker. You can now explore features like adding users, clients, or roles in the admin console. Let me know if you hit any snags!

Let’s set up a realm in Keycloak and integrate it with a React ViteJS app for login support. I’ll break this into two parts: configuring Keycloak and setting up the React code. Each step will be simple and explained clearly.

---

### Part 1: Setting Up a Realm in Keycloak
Assuming you’ve already got Keycloak running locally on Docker (from the previous guide), here’s how to configure a realm and a client for your React app.

#### Step 1: Log In to Keycloak Admin Console
- Open your browser and go to `http://localhost:8080`.
- Click "Administration Console" and log in with:
  - Username: `admin`
  - Password: `admin`

#### Step 2: Create a New Realm
- **What it does**: A realm is like a separate workspace in Keycloak for your app.
- **How to do it**:
  - In the top-left corner, hover over "Master" and click "Create Realm".
  - In the "Name" field, type `my-app-realm` (or any name you like).
  - Click "Create". You’ll see "my-app-realm" in the dropdown now—select it.

#### Step 3: Create a Client for Your React App
- **What it does**: A client represents your React app in Keycloak, allowing it to use Keycloak for login.
- **How to do it**:
  - In the left menu, click "Clients".
  - Click "Create client" (top right).
  - Set:
    - **Client type**: `OpenID Connect`
    - **Client ID**: `react-app` (this is what you’ll use in your React code).
  - Click "Next".
  - Enable "Client authentication" (toggle to ON) and leave other settings as default.
  - Click "Next".
  - Set:
    - **Valid redirect URIs**: `http://localhost:5173/*` (Vite’s default port; use `*` for all routes).
    - **Web origins**: `http://localhost:5173` (allows CORS requests).
  - Click "Save".

#### Step 4: Create a Test User
- **What it does**: Adds a user to log in with from your React app.
- **How to do it**:
  - In the left menu, click "Users".
  - Click "Add user" (top right).
  - Set:
    - **Username**: `testuser`
  - Click "Create".
  - Go to the "Credentials" tab for this user, click "Set password", enter `password` (or anything simple), disable "Temporary", and save.

#### Step 5: Get Client Details
- **What it does**: You’ll need some info to connect your React app to Keycloak.
- **How to do it**:
  - Go to "Clients" > click "react-app".
  - Note the "Client ID" (`react-app`).
  - Go to "Realm settings" > "OpenID Endpoint Configuration" (a link at the bottom). This opens a JSON file. Copy the `issuer` URL (e.g., `http://localhost:8080/realms/my-app-realm`)—you’ll use this later.

---

### Part 2: Setting Up Your React ViteJS App
Now, let’s create a simple React app with Vite and integrate Keycloak for login. I’ll assume you’re starting fresh.

#### Step 1: Create a Vite React App
- Open your terminal and run:
  ```
  npm create vite@latest my-react-app -- --template react
  cd my-react-app
  npm install
  ```
- This sets up a basic React app with Vite.

#### Step 2: Install Keycloak JS Library
- **What it does**: Adds the Keycloak JavaScript adapter to handle authentication.
- **How to do it**:
  - In the terminal (inside `my-react-app` folder), run:
    ```
    npm install keycloak-js
    ```

#### Step 3: Set Up Keycloak in React
- Replace your app’s code with the following to integrate Keycloak login:

```javascript
import { useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080', // Keycloak server URL
  realm: 'my-app-realm',        // Your realm name
  clientId: 'react-app',        // Your client ID
});

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required' }) // Forces login on page load
      .then((auth) => {
        setAuthenticated(auth);
        if (auth) {
          setUserName(keycloak.tokenParsed?.preferred_username || 'User');
        }
      })
      .catch((err) => console.error('Keycloak init failed:', err));
  }, []);

  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <div style={{ padding: '20px' }}>
      {authenticated ? (
        <>
          <h1>Welcome, {userName}!</h1>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default App;
```

#### Step 4: Run Your React App
- In the terminal, run:
  ```
  npm run dev
  ```
- Open your browser to `http://localhost:5173`. You’ll be redirected to the Keycloak login page.

#### Step 5: Test the Login
- On the Keycloak login page:
  - Enter `testuser` as the username.
  - Enter `password` as the password.
  - Click "Sign In".
- You’ll be redirected back to your app, greeted with "Welcome, testuser!" and a logout button.

---

### How It Works
- **Keycloak Setup**: The realm (`my-app-realm`) and client (`react-app`) define how your app interacts with Keycloak. The redirect URI ensures Keycloak sends users back to your app after login.
- **React Code**: The `keycloak-js` library handles authentication. `init({ onLoad: 'login-required' })` forces users to log in. Once authenticated, the app shows the user’s name (from the token) and a logout option.

### Next Steps
- Customize the UI or add protected routes using `keycloak.authenticated` and `keycloak.token`.
- Secure API calls by sending `keycloak.token` in the Authorization header (e.g., `Bearer <token>`).

Let me know if you need help tweaking this further!

