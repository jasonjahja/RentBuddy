import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch items from the database
    const items = await prisma.item.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        isAvailable: true,
        url: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
        ownerId: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
