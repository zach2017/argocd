// app/routes/_index.tsx
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Keycloak Example" },
    { name: "description", content: "Welcome!" },
  ];
};

export default function Index() {
  return (
    <div>
      <h1>Welcome to Remix with Keycloak Auth</h1>
      <p>
         Try accessing the <Link to="/protected">Protected Page</Link>.
      </p>
       <p>
         If you are not logged in, you should be redirected to the <Link to="/login">Login Page</Link>.
      </p>
    </div>
  );
}