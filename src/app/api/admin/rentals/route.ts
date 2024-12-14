import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rentals = await prisma.rental.findMany({
      include: {
        user: true,
        item: true,
      },
    });

    if (!rentals) {
      return NextResponse.json(
        { error: "No rentals found." },
        { status: 404 }
      );
    }

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return NextResponse.json(
      { error: "Failed to fetch rentals." },
      { status: 500 }
    );
  }
}
