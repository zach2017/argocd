// app/routes/login.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { getSession, commitSession, getUser } from "~/services/session.server"; // Adjust path as needed
import { redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  // If user is already logged in, redirect them away from login page
  const user = await getUser(request);
  if (user) {
      return redirect("/protected"); // or "/" or wherever you want logged-in users to go
  }
   // Need to handle potential session commit if `redirectTo` was set by requireUser
  const session = await getSession(request.headers.get("Cookie"));
  return new Response(null, {
      headers: {
          "Set-Cookie": await commitSession(session), // Ensure session cookie is sent back if modified
      }
  })
}


export default function LoginPage() {
  return (
    <div>
      <h2>Login Required</h2>
      <p>Please log in to continue.</p>
      {/* This form POSTs to the action which then redirects */}
      <Form action="/auth/keycloak" method="post">
         <button type="submit">Login with Keycloak</button>
      </Form>
      {/* Or a simple link GETting the redirect route */}
      {/* <a href="/auth/keycloak">Login with Keycloak (GET)</a> */}
    </div>
  );
}