// app/root.tsx (simplified example - integrate with your existing root.tsx)
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Link, // Import Link
  Form   // Import Form
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUser } from "~/services/session.server"; // Import getUser

// Add other imports (stylesheets, etc.)

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({ user }); // Pass user status to the client
}


export default function App() {
  const { user } = useLoaderData<typeof loader>(); // Get user from loader data

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link> | {" "}
            {user ? (
              <>
                <Link to="/protected">Protected Page</Link> | {" "}
                <span>Welcome, {user.name}!</span> | {" "}
                <Form action="/logout" method="post" style={{ display: 'inline' }}>
                  <button type="submit">Logout</button>
                </Form>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </nav>
        </header>
        <main>
           <Outlet />
        </main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}