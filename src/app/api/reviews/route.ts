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

// POST: Create or Update a review
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, rentalId, rating, comment } = body;

    console.log("Received Payload:", { userId, name, rentalId, rating, comment });

    // Validate input
    const parsedUserId = parseInt(userId, 10);
    const parsedRentalId = parseInt(rentalId, 10);

    if (
      isNaN(parsedUserId) ||
      isNaN(parsedRentalId) ||
      !rating ||
      rating < 1 ||
      rating > 5 ||
      !name
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input. Ensure all fields are provided and valid.",
        },
        { status: 400 }
      );
    }

    // Find the rental and associated item
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

    // Check if the user has already left a review for this rental's item
    const existingReview = await prisma.review.findFirst({
      where: {
        user: parsedUserId,
        itemId,
      },
    });

    if (existingReview) {
      // Update the existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment, name },
      });

      return NextResponse.json({
        success: true,
        message: "Review updated successfully.",
        data: updatedReview,
      });
    }

    // Create a new review
    const newReview = await prisma.review.create({
      data: {
        user: parsedUserId,
        name, // Store the user's name
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

// PUT: Update a review
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { rentalId, rating, comment, name } = body;

    console.log("Received Payload for PUT:", { rentalId, rating, comment, name });

    if (!rentalId || !rating || rating < 1 || rating > 5 || !name || !comment) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input. Ensure all fields are provided and valid.",
        },
        { status: 400 }
      );
    }

    // Update the existing review
    const updatedReview = await prisma.review.update({
      where: { id: rentalId },
      data: { rating, comment, name },
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

// GET: Fetch the review for a rental
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const rentalId = searchParams.get("rentalId");

  const parsedUserId = parseInt(userId || "", 10);
  const parsedRentalId = parseInt(rentalId || "", 10);

  if (isNaN(parsedUserId) || isNaN(parsedRentalId)) {
    return NextResponse.json(
      { success: false, error: "Valid userId and rentalId are required." },
      { status: 400 }
    );
  }

  try {
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

    const existingReview = await prisma.review.findFirst({
      where: {
        user: parsedUserId,
        itemId: rental.item.id,
      },
      select: {
        id: true,
        user: true,
        name: true,
        rating: true,
        comment: true,
      },
    });

    if (existingReview) {
      return NextResponse.json({ success: true, data: existingReview });
    }

    return NextResponse.json(
      { success: false, error: "No review found for this rental." },
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
