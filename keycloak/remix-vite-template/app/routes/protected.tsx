// app/routes/protected.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUser } from "./auth.server"; // Our helper

export async function loader({ request }: LoaderFunctionArgs) {
  // This will redirect to /login if the user isn't authenticated
  const user = await requireUser(request);
  // If requireUser doesn't throw, the user is authenticated.
  // We can now safely load data for this user.
  return json({ user });
}

export default function ProtectedPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h2>Protected Area</h2>
      <p>Welcome, {user.name || user.id}!</p>
      <p>Your email: {user.email || "Not available"}</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      <Form action="/logout" method="post">
        <button type="submit">Logout</button>
      </Form>
    </div>
  );
}