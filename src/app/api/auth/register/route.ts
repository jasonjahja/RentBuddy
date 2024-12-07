import { NextResponse } from "next/server";
import { addUser } from "../../../../lib/userData";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Add the user using the reusable `addUser` function
    const newUser = await addUser(name, email, password);

    return NextResponse.json(
      { message: "User registered successfully.", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    // Narrow the type of error to ensure `message` is accessible
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Something went wrong." },
        { status: 400 }
      );
    }

    // Handle unknown error type
    return NextResponse.json(
      { error: "An unknown error occurred." },
      { status: 500 }
    );
  }
}
