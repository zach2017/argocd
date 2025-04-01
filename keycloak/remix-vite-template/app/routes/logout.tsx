// app/routes/logout.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSession, destroySession, getTokens } from "~/services/session.server";
import { getLogoutUrl } from "~/routes/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const tokens = await getTokens(request); // Get tokens to provide id_token_hint

  let keycloakLogoutUrl = "/"; // Default redirect if Keycloak logout fails or isn't needed

  if (tokens?.idToken) {
      try {
          keycloakLogoutUrl = getLogoutUrl(tokens.idToken);
      } catch (e) {
          console.error("Failed to generate Keycloak logout URL", e);
          // Proceed with local logout anyway
      }
  } else {
      console.warn("No idToken found in session for Keycloak logout hint.");
  }


  return redirect(keycloakLogoutUrl, {
    headers: {
      // Destroy the Remix session cookie
      "Set-Cookie": await destroySession(session),
    },
  });
}

// You shouldn't need a loader or default export for an action-only route
// that always redirects. Remix handles this.