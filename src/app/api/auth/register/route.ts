import { NextResponse } from "next/server";
import { addUser } from "../../../../lib/userData";

export async function POST(request: Request) {
  try {
    const { username, email, password, role } = await request.json();

    console.log("Request payload:", { username, email, password, role });

    // Validate input presence
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: "Username, email, password, and role are required." },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== "renter" && role !== "owner") {
      return NextResponse.json(
        { error: "Role must be either 'renter' or 'owner'." },
        { status: 400 }
      );
    }

    // Call the addUser function to create a new user
    const newUser = await addUser(username, email, password, role);

    // If successful, return the newly created user
    return NextResponse.json(
      {
        message: "User registered successfully.",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          trust_score: newUser.trust_score || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);

    // Handle errors from addUser function
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Something went wrong." },
        { status: 400 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: "An unknown error occurred." },
      { status: 500 }
    );
  }
}
