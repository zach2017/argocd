// app/services/auth.server.ts
import { redirect } from "@remix-run/node";
import { sessionStorage, getSession, commitSession } from "../services/session.server";
import crypto from "crypto"; // Built-in Node.js crypto library
import invariant from "tiny-invariant";

// --- Configuration ---
invariant(process.env.KEYCLOAK_URL, "KEYCLOAK_URL must be set");
invariant(process.env.KEYCLOAK_REALM, "KEYCLOAK_REALM must be set");
invariant(process.env.KEYCLOAK_CLIENT_ID, "KEYCLOAK_CLIENT_ID must be set");
invariant(process.env.KEYCLOAK_CLIENT_SECRET, "KEYCLOAK_CLIENT_SECRET must be set");
invariant(process.env.APP_BASE_URL, "APP_BASE_URL must be set");

const keycloakBaseUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect`;
const clientId = process.env.KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
const appBaseUrl = process.env.APP_BASE_URL;
const redirectUri = `${appBaseUrl}/auth/keycloak/callback`;

// --- PKCE Helpers ---
function base64URLEncode(str: Buffer): string {
  return str.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function sha256(buffer: string): Buffer {
  return crypto.createHash("sha256").update(buffer).digest();
}

// --- Authentication Functions ---

/**
 * Generates PKCE values and the Keycloak authorization URL.
 * Stores the code_verifier in the session.
 */
export async function getAuthorizationUrl(request: Request): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"));

  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(sha256(codeVerifier));

  // Store the code verifier in the session to use in the callback
  session.set("codeVerifier", codeVerifier);

  // You can also add a 'state' parameter for CSRF protection
  // const state = base64URLEncode(crypto.randomBytes(16));
  // session.set("state", state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email", // Request basic OIDC scopes + profile + email
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    // state: state, // Include if using state
  });

  // Important: We need to commit the session *before* redirecting
  // This isn't directly possible here, so the route calling this will handle it.
  // This function now primarily returns the URL and expects the caller to handle session commit.

  return `${keycloakBaseUrl}/auth?${params.toString()}`;
}

/**
 * Exchanges the authorization code for tokens at Keycloak's token endpoint.
 */
export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<{accessToken: string, idToken: string, refreshToken?: string}> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret, // Required for confidential clients
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier, // Send the verifier for PKCE validation
  });

  const response = await fetch(`${keycloakBaseUrl}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Keycloak token exchange failed:", response.status, errorBody);
    throw new Response("Failed to exchange code for tokens", { status: response.status });
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token, // May not be present depending on scope/config
  };
}

/**
 * Fetches user information from Keycloak's userinfo endpoint.
 */
export async function getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`${keycloakBaseUrl}/userinfo`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Keycloak userinfo fetch failed:", response.status, errorBody);
        throw new Response("Failed to fetch user info", { status: response.status });
    }

    return await response.json();
}

/**
 * Generates the Keycloak logout URL.
 */
export function getLogoutUrl(idToken: string): string {
    const params = new URLSearchParams({
        client_id: clientId,
        id_token_hint: idToken, // Tell Keycloak who is logging out
        post_logout_redirect_uri: appBaseUrl, // Where to redirect after Keycloak logout
    });
    return `${keycloakBaseUrl}/logout?${params.toString()}`;
}

/**
 * A helper function for protecting routes.
 * Redirects to login if the user is not authenticated.
 */
export async function requireUser(request: Request): Promise<any> {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    // Store the intended destination before redirecting to login
    const currentPath = new URL(request.url).pathname;
    session.set("redirectTo", currentPath);

    throw redirect("/login", {
        headers: {
            "Set-Cookie": await commitSession(session),
        }
    });
  }
  return user; // Return the user data
}