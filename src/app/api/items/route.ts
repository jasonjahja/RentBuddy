import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, price, category, isAvailable, url } = body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: "All fields (title, description, price, category) are required." },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // Create a new item in the database
    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        price: Number(price), // Ensure price is stored as a number
        category,
        isAvailable: isAvailable ?? true,
        url: url || "/images/default.png", // Use fallback image URL
        slug,
        owner: { connect: { id: Number(session.user.id) } }, // Assign the owner
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating new item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    // If a specific item slug is requested
    if (slug) {
      const item = await prisma.item.findUnique({
        where: { slug },
        include: { itemReviews: true }, // Include itemReviews instead of reviews
      });

      if (!item) {
        return NextResponse.json(
          { error: "Item not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(item, { status: 200 });
    }

    // Fetch all items if no slug is provided
    const items = await prisma.item.findMany({
      include: { itemReviews: true }, // Include itemReviews instead of reviews
    });

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
