import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: {
        owner: true, // Adjust according to your schema
        itemReviews: true,
      },
    });

    if (!items) {
      return NextResponse.json(
        { error: "No items found." },
        { status: 404 }
      );
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items." },
      { status: 500 }
    );
  }
}
