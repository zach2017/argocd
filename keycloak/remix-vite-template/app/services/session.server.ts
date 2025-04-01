// app/services/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session", // use any name you want here
    httpOnly: true, // for security reasons, make this cookie http only
    path: "/", // remember to add this so the cookie will work in all routes
    sameSite: "lax", // protect against CSRF
    secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

// You can also export the methods individually for convenience
export const { getSession, commitSession, destroySession } = sessionStorage;

// Helper function to get user data from session
export async function getUser(request: Request): Promise<any | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  // Basic check, you might want to validate tokens/expiry here in a real app
  return user ? user : null;
}

// Helper to get tokens (if stored)
export async function getTokens(request: Request): Promise<{ accessToken: string; idToken: string; refreshToken: string } | null> {
    const session = await getSession(request.headers.get("Cookie"));
    const accessToken = session.get("accessToken");
    const idToken = session.get("idToken");
    const refreshToken = session.get("refreshToken");

    if (accessToken && idToken) { // refreshToken might not always be present depending on scope/config
        return { accessToken, idToken, refreshToken };
    }
    return null;
}