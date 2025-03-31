Keycloak 

Here's a simple, step-by-step guide to setting up Keycloak locally using Docker. I’ll explain each step clearly so you can follow along easily.

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

