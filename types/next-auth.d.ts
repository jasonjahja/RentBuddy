import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  // Extend Session object
  interface Session extends DefaultSession {
    user: {
      id: string; // Add id
      username: string; // Add username
    } & DefaultSession["user"];
  }

  // Extend JWT object
  interface JWT extends DefaultJWT {
    id: string; // Include id in the token
    username: string; // Include username in the token
  }

  // Extend User object
  interface User {
    id: string; // Add id to the user object
    email: string; // Email is always present in your user model
    username: string; // Add username
  }
}
