import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUser } from "../../../../lib/userData";

// Internal authOptions object
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

        // Convert id to string to match next-auth User type
        return { id: String(user.id), email: user.email, username: user.username };
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
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to the session object
      session.user = {
        id: token.id as string,
        email: token.email as string,
        username: token.username as string,
      };
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
};

// Handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
