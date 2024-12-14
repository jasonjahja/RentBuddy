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
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, description, price, category, isAvailable, url, ownerId } =
      body;

    // Validate input
    if (!title || !description || !price || !category || !ownerId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        price,
        category,
        isAvailable: isAvailable ?? true,
        url: url ?? "/images/default.png",
        slug,
        ownerId,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json(
      { error: "Failed to add item" },
      { status: 500 }
    );
  }
}
