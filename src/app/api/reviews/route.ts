import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

// POST: Create or Update an item review
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { renterId, rentalId, rating, comment } = body;

    console.log("Received Payload:", { renterId, rentalId, rating, comment });

    const parsedRenterId = parseInt(renterId, 10);
    const parsedRentalId = parseInt(rentalId, 10);

    if (
      isNaN(parsedRenterId) ||
      isNaN(parsedRentalId) ||
      !rating ||
      rating < 1 ||
      rating > 5 ||
      !comment
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input. Ensure all fields are provided and valid.",
        },
        { status: 400 }
      );
    }

    const rental = await prisma.rental.findUnique({
      where: { id: parsedRentalId },
      include: { item: true },
    });

    if (!rental) {
      return NextResponse.json(
        { success: false, error: "Rental not found." },
        { status: 404 }
      );
    }

    const itemId = rental.item.id;

    const existingReview = await prisma.itemReview.findFirst({
      where: {
        renterId: parsedRenterId,
        itemId,
      },
    });

    if (existingReview) {
      const updatedReview = await prisma.itemReview.update({
        where: { id: existingReview.id },
        data: { rating, comment },
      });

      return NextResponse.json({
        success: true,
        message: "Review updated successfully.",
        data: updatedReview,
      });
    }

    const newReview = await prisma.itemReview.create({
      data: {
        renterId: parsedRenterId,
        comment,
        rating,
        itemId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review created successfully.",
      data: newReview,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error:", error.message);
      return NextResponse.json(
        { success: false, error: "Database error occurred." },
        { status: 500 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PUT: Update an item review
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { reviewId, rating, comment } = body;

    console.log("Received Payload for PUT:", { reviewId, rating, comment });

    if (!reviewId || !rating || rating < 1 || rating > 5 || !comment) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input. Ensure all fields are provided and valid.",
        },
        { status: 400 }
      );
    }

    const updatedReview = await prisma.itemReview.update({
      where: { id: reviewId },
      data: { rating, comment },
    });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully.",
      data: updatedReview,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error:", error.message);
      return NextResponse.json(
        { success: false, error: "Database error occurred." },
        { status: 500 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// GET: Fetch the review for an item
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const renterId = searchParams.get("renterId");
  const itemId = searchParams.get("itemId");

  const parsedRenterId = parseInt(renterId || "", 10);
  const parsedItemId = parseInt(itemId || "", 10);

  if (isNaN(parsedRenterId) || isNaN(parsedItemId)) {
    return NextResponse.json(
      { success: false, error: "Valid renterId and itemId are required." },
      { status: 400 }
    );
  }

  try {
    const existingReview = await prisma.itemReview.findFirst({
      where: {
        renterId: parsedRenterId,
        itemId: parsedItemId,
      },
      select: {
        id: true,
        renterId: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    if (existingReview) {
      return NextResponse.json({ success: true, data: existingReview });
    }

    return NextResponse.json(
      { success: false, error: "No review found for this item." },
      { status: 404 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error:", error.message);
      return NextResponse.json(
        { success: false, error: "Database error occurred." },
        { status: 500 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
