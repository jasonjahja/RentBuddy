import { NextResponse } from "next/server";
import { addUser } from "../../../../lib/userData";

export async function POST(request: Request) {
  try {
    const { username, email, password, role } = await request.json();

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

    // Add user with role
    const newUser = await addUser(username, email, password, role);

    return NextResponse.json(
      {
        message: "User registered successfully.",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          trust_score: newUser.trust_score || null, // Only if role is renter
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Something went wrong." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred." },
      { status: 500 }
    );
  }
}
