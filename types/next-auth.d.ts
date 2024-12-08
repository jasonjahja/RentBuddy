import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  // Extend Session object
  interface Session extends DefaultSession {
    user: {
      id: string; // Add id
    } & DefaultSession["user"];
  }

  // Extend JWT object
  interface JWT extends DefaultJWT {
    id: string; // Include id in the token
  }

  // Extend User object
  interface User {
    id: string; // Add id to the user object
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}
