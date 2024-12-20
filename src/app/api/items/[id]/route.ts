import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Disable Next.js cache for this route to ensure fresh data
export const dynamic = 'force-dynamic';

// Create a single instance of PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

type ItemInput = {
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  url: string;
};

// Helper function for input validation
function validateItemInput(data: ItemInput): string[] {
  const errors: string[] = [];
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push("Title is required and must be a non-empty string");
  }
  if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
    errors.push("Description is required and must be a non-empty string");
  }
  if (typeof data.price !== 'number' || data.price <= 0) {
    errors.push("Price must be a positive number");
  }
  if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
    errors.push("Category is required and must be a non-empty string");
  }
  if (typeof data.isAvailable !== 'boolean') {
    errors.push("isAvailable must be a boolean");
  }
  if (data.url !== null && (typeof data.url !== 'string' || data.url.trim() === '')) {
    errors.push("URL must be either null or a non-empty string");
  }
  return errors;
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json(); // Parse the request body
    const { itemId } = body; // Extract itemId from the request body

    // Validate itemId
    if (!itemId || isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid or missing item ID. Must be a valid number." },
        { status: 400 }
      );
    }

    // Use transaction to ensure all operations complete or none do
    await prisma.$transaction(async (tx) => {
      // Check if item exists first
      const existingItem = await tx.item.findUnique({
        where: { id: itemId },
      });

      if (!existingItem) {
        throw new Error("Item not found");
      }

      // Delete related records
      await tx.itemReview.deleteMany({
        where: { itemId },
      });

      await tx.rental.deleteMany({
        where: { itemId },
      });

      // Delete the item
      await tx.item.delete({
        where: { id: itemId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting item:", error);

    if (error instanceof Error && error.message === "Item not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Item not found. It may have already been deleted.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete item. Please try again later.",
      },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { itemId, ...updateData }: ItemInput & { itemId: number } = body;

    if (!itemId || isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing item ID." },
        { status: 400 }
      );
    }

    // Validate input
    const validationErrors = validateItemInput(updateData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = updateData.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(String(itemId), 10) },
      data: {
        ...updateData,
        slug,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update item." },
      { status: 500 }
    );
  }
}


export async function GET(req: Request) {
  try {
    const body = await req.json();
    const { itemId } = body;

    if (!itemId || isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing item ID." },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId, 10) },
      include: {
        itemReviews: {
          orderBy: { createdAt: "desc" },
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
        { success: false, error: "Item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}