import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUser } from "../../../../lib/userData";

const authOptions: AuthOptions = {
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

        // Validate the user's credentials
        const user = await validateUser(credentials.email, credentials.password);
        if (!user) {
          console.error("Invalid credentials for email:", credentials.email);
          return null;
        }

        // Ensure role is of type "renter" | "owner"
        const role = user.role as "renter" | "owner";
        if (role !== "renter" && role !== "owner") {
          console.error("Invalid role in user data:", user.role);
          return null;
        }

        // Include role and trust_score (if renter)
        return {
          id: String(user.id),
          email: user.email,
          username: user.username,
          role,
          trust_score: role === "renter" ? user.trust_score ?? undefined : undefined, // Ensure trust_score is undefined if null
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens for session handling
  },
  secret: process.env.JWT_SECRET || "default_jwt_secret", // Ensure this is set properly in production
  callbacks: {
    async jwt({ token, user }) {
      // Add user details to the JWT if available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.trust_score = user.trust_score ?? undefined; // Ensure trust_score is undefined if null
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to the session object
      session.user = {
        id: token.id as string,
        email: token.email as string,
        username: token.username as string,
        role: token.role as "renter" | "owner",
        trust_score: token.trust_score, // trust_score will now be undefined if not applicable
      };
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
};

// Handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
