import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Add a new user to the database.
 * @param username - User's username.
 * @param email - User's email.
 * @param password - Plain text password.
 * @returns The created user object.
 */
export async function addUser(username: string, email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return newUser;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const targetFields = error.meta?.target as string[]; // Explicitly assert meta.target as an array of strings

      if (targetFields?.includes("username")) {
        throw new Error("This username is already taken. Please choose another.");
      }
      if (targetFields?.includes("email")) {
        throw new Error("This email is already registered. Please use a different email.");
      }
    }

    // Re-throw other errors
    throw error;
  }
}


/**
 * Validate a user's credentials.
 * @param email - User's email.
 * @param password - Plain text password.
 * @returns The user object if valid, or null if invalid.
 */
export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null; // User not found
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null; // Incorrect password
  }

  return user; // Valid user
}

/**
 * Get all users (for debugging purposes).
 * @returns A list of all users.
 */
export async function getUsers() {
  return await prisma.user.findMany();
}
