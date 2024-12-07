import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUser } from "../../../../lib/userData";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Credentials received:", credentials);

        if (!credentials || !credentials.email || !credentials.password) {
          console.error("Missing email or password");
          return null;
        }

        const user = await validateUser(credentials.email, credentials.password);
        if (!user) {
          console.error("Invalid credentials for email:", credentials.email);
          return null;
        }

        console.log("Authorized user:", user);
        return { id: user.id, email: user.email, name: user.name }; // Return the user object
      },
    }),
  ],
  session: {
    strategy: "jwt", // JWT for session management
  },
  secret: process.env.JWT_SECRET || "default_jwt_secret", // Add fallback for development
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name; // Include name in the token
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string, // Map id from token
        email: token.email,
        name: token.name, // Map name from token
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
