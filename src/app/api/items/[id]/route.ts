import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    // Extract the 'id' parameter from the URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract the last part of the URL (assumes it's the ID)

    // Validate the item ID
    const itemId = parseInt(id || "", 10);
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID. Must be a valid number." },
        { status: 400 }
      );
    }

    // Check if the item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found. It may have already been deleted." },
        { status: 404 }
      );
    }

    // Delete the item from the database
    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);

    // Handle server errors
    return NextResponse.json(
      { error: "Failed to delete item. Please try again later." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // Extract the 'id' parameter from the URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract the last part of the URL (assumes it's the ID)

    // Validate the itemId
    const itemId = parseInt(id || "", 10);
    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing item ID." },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { title, description, price, category, isAvailable, url: itemUrl } = body;

    // Validate the required fields
    if (!title || !description || typeof price !== "number" || !category) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // Update the item in the database
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        title,
        description,
        price,
        category,
        isAvailable,
        url: itemUrl,
        slug,
      },
    });

    // Return the updated item
    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);

    // Handle server errors
    return NextResponse.json(
      { success: false, error: "Failed to update item." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Extract the 'id' parameter from the URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract the last part of the URL (assumes it's the ID)

    // Validate the 'id' parameter
    const itemId = parseInt(id || "", 10);
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid or missing item ID." },
        { status: 400 }
      );
    }

    // Fetch the item from the database
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        itemReviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            renter: {
              select: { username: true },
            },
          },
        },
      },
    });

    // Handle item not found
    if (!item) {
      return NextResponse.json(
        { error: "Item not found." },
        { status: 404 }
      );
    }

    // Return the item as JSON
    return NextResponse.json(item, { status: 200 });
  } catch (err) {
    console.error("Error fetching item:", err);

    // Handle server errors
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
