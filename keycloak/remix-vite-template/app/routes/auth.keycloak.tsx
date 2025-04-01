// app/routes/auth.keycloak.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getAuthorizationUrl } from "./auth.server";
import { getSession, commitSession } from "~/services/session.server";

// Handles POST requests (e.g., from a login form button)
export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const authorizationUrl = await getAuthorizationUrl(request); // Will set codeVerifier in session

  // Important: Commit the session *before* redirecting to store codeVerifier
  return redirect(authorizationUrl, {
      headers: {
          "Set-Cookie": await commitSession(session),
      },
  });
}

// Optional: Handles GET requests (e.g., from a direct link)
// You might only need action OR loader depending on how you trigger login
export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const authorizationUrl = await getAuthorizationUrl(request); // Will set codeVerifier in session

    return redirect(authorizationUrl, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}