import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  // Extend Session object
  interface Session extends DefaultSession {
    user: {
      id: string; // Add id
      username: string; // Add username
      email: string; // Add email (already exists in DefaultSession but explicitly listed here)
      role: "renter" | "owner"; // Add role
      trust_score?: number; // Add trust score, optional for owners
    } & DefaultSession["user"];
  }

  // Extend User object
  interface User {
    id: string; // Add id to the user object
    email: string; // Email is always present in your user model
    username: string; // Add username
    role: "renter" | "owner"; // Add role
    trust_score?: number; // Add trust score, optional for owners
  }
}

declare module "next-auth/jwt" {
  // Extend JWT object
  interface JWT extends DefaultJWT {
    id: string; // Include id in the token
    username: string; // Include username in the token
    email: string; // Include email in the token
    role: "renter" | "owner"; // Include role in the token
    trust_score?: number; // Include trust score, optional for owners
  }
}
