import bcrypt from "bcrypt";

interface User {
  id: string;
  email: string;
  password: string;
}

const users: User[] = []; // Shared in-memory user database

/**
 * Add a new user to the database.
 * @param email - User's email.
 * @param password - Plain text password.
 * @returns The created user object.
 */
export async function addUser(email: string, password: string): Promise<User> {
  // Check if the user already exists
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    throw new Error("User already exists.");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user
  const newUser: User = {
    id: String(users.length + 1),
    email,
    password: hashedPassword,
  };

  // Add to the shared users array
  users.push(newUser);

  return newUser;
}

/**
 * Validate a user's credentials.
 * @param email - User's email.
 * @param password - Plain text password.
 * @returns The user object if valid, or null if invalid.
 */
export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = users.find((u) => u.email === email);
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
 */
export function getUsers(): User[] {
  return users;
}
