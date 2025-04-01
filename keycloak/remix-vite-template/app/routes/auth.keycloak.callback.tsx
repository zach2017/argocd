// app/routes/auth.keycloak.tsx (Loader or Action initiating the flow)
import { redirect } from "@remix-run/node";
import { getSession, commitSession } from "~/services/session.server";
import { getAuthorizationUrl } from "~/routes/auth.server"; // Or wherever PKCE is generated/URL is built
import crypto from "crypto"; // Or your crypto source

function base64URLEncode(str: Buffer): string {
     return str.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function sha256(buffer: string): Buffer {
     return crypto.createHash("sha256").update(buffer).digest();
}


// Example using a loader:
export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));

    // 1. Generate PKCE values
    const codeVerifier = base64URLEncode(crypto.randomBytes(32));
    const codeChallenge = base64URLEncode(sha256(codeVerifier));

    console.log("DEBUG [Auth Start]: Generated codeVerifier:", codeVerifier); // Log for debugging

    // 2. Store the verifier in the session object
    session.set("codeVerifier", codeVerifier);
    console.log("DEBUG [Auth Start]: Set codeVerifier in session object");

    // 3. Get the Keycloak URL (pass challenge etc.)
    const params = new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        redirect_uri: `${process.env.APP_BASE_URL}/auth/keycloak/callback`,
        response_type: "code",
        scope: "openid profile email",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
    });
    const keycloakBaseUrl = `<span class="math-inline">\{process\.env\.KEYCLOAK\_URL\}/realms/</span>{process.env.KEYCLOAK_REALM}/protocol/openid-connect`;
    const authorizationUrl = `<span class="math-inline">\{keycloakBaseUrl\}/auth?</span>{params.toString()}`;

    console.log("DEBUG [Auth Start]: Redirecting to:", authorizationUrl);
    console.log("DEBUG [Auth Start]: Session data before commit:", JSON.stringify(session.data));


    // 4. *** CRITICAL: Commit the session in the redirect headers ***
    return redirect(authorizationUrl, {
        headers: {
            "Set-Cookie": await commitSession(session), // Send updated cookie back!
        },
    });
}