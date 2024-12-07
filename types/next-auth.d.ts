import type { DefaultJWT } from "next-auth";

declare module "next-auth" {
  // Extend Session object
  interface Session {
    user: {
      id: string; // Include id
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  // Extend JWT object
  interface JWT extends DefaultJWT {
    id: string; // Include id in the token
    email?: string | null;
  }

  // Extend User object
  interface User {
    id: string; // Add id to the user object
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}
