import CredentialsProvider from "next-auth/providers/credentials";
import { validateUser } from "./userData";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        // Validate the user's credentials
        const user = await validateUser(credentials.email, credentials.password);
        if (!user) {
          throw new Error("Invalid email or password.");
        }

        // Convert id to string to match next-auth User type
        return { id: String(user.id), username: user.username, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens for session handling
  },
  secret: process.env.JWT_SECRET, // Ensure this is defined in your .env file
};
