import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

/**
 * POST /api/items
 * Create a new item and provide a recommended price based on the category.
 */
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

    // Fetch average price for the category to recommend a price
    const categoryPricing = await prisma.item.aggregate({
      where: { category },
      _avg: { price: true },
    });
    const recommendedPrice = categoryPricing._avg.price || price;

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

    return NextResponse.json(
      { item: newItem, recommendedPrice },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating new item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/items
 * Fetch all items or a single item by slug.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      const item = await prisma.item.findUnique({
        where: { slug },
        include: {
          owner: {
            select: { username: true }, // Fetch the owner's username
          },
          itemReviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              renter: {
                select: { username: true },
              },
            },
          },
        },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Item not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(item, { status: 200 });
    }

    const items = await prisma.item.findMany({
      include: {
        owner: {
          select: { username: true }, // Fetch the owner's username
        },
        itemReviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            renter: {
              select: { username: true },
            },
          },
        },
      },
    });

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("Error fetching items:", err);

    // Safeguard against non-object `err` values
    const errorResponse = {
      error: "Internal server error",
      details: err instanceof Error ? err.message : "Unknown error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
