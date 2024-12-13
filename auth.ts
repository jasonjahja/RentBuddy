import NextAuth, { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

import { validateUser } from "@/src/lib/userData";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter your email" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password");
          return null;
        }

        const user = await validateUser(credentials.email, credentials.password);
        if (!user) {
          console.error("Invalid credentials for email:", credentials.email);
          return null;
        }

        if (!["renter", "owner"].includes(user.role)) {
          console.error("Invalid role in user data:", user.role);
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          username: user.username,
          role: user.role as "renter" | "owner",
          trust_score: user.role === "renter" ? user.trust_score ?? undefined : undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.JWT_SECRET || "default_jwt_secret",
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.trust_score = user.trust_score ?? undefined;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        username: token.username as string,
        role: token.role as "renter" | "owner",
        trust_score: token.trust_score,
      };
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

// Create and export the `auth` function for server use
export const auth = async (req?: Request) => {
  return getServerSession(authOptions);
};

// Export handlers explicitly
export const GET = handler;
export const POST = handler;
