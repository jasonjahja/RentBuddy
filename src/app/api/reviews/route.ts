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

    // Check if the renter has already left a review for this rental's item
    const existingReview = await prisma.itemReview.findFirst({
      where: {
        renterId: parsedRenterId,
        itemId,
      },
    });

    if (existingReview) {
      // Update the existing review (keep createdAt intact)
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

    // Create a new review
    const newReview = await prisma.itemReview.create({
      data: {
        renterId: parsedRenterId,
        comment,
        rating,
        itemId,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Review created successfully.",
      data: newReview,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rentalId = searchParams.get("rentalId");

  const parsedRentalId = parseInt(rentalId || "", 10);

  if (isNaN(parsedRentalId)) {
    return NextResponse.json(
      { success: false, error: "Valid rentalId is required." },
      { status: 400 }
    );
  }

  try {
    // Fetch rental details (includes item and user for renter info)
    const rental = await prisma.rental.findUnique({
      where: { id: parsedRentalId },
      include: {
        item: true, // Fetch item details
        user: { select: { id: true, username: true } }, // Fetch user (renter) details
      },
    });

    if (!rental) {
      return NextResponse.json(
        { success: false, error: "Rental not found." },
        { status: 404 }
      );
    }

    const { item, user } = rental;

    const existingReview = await prisma.itemReview.findFirst({
      where: {
        renterId: user.id,
        itemId: item.id,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true, // Include createdAt
        renter: {
          select: { username: true },
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({
        success: true,
        data: {
          id: existingReview.id,
          rating: existingReview.rating,
          comment: existingReview.comment,
          createdAt: existingReview.createdAt, // Include createdAt
          renterName: existingReview.renter?.username || user.username || null,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "No review found for this rental." },
      { status: 404 }
    );
  } catch (error) {
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
    const { rentalId, rating, comment } = body;

    if (!rentalId || isNaN(rating) || rating < 1 || rating > 5 || !comment) {
      return NextResponse.json(
        { success: false, error: "Invalid input. Ensure all fields are provided and valid." },
        { status: 400 }
      );
    }

    const parsedRentalId = parseInt(rentalId, 10);

    // Fetch the rental to get the renterId and itemId
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

    const { itemId, userId: renterId } = rental;

    // Check if the review exists
    const existingReview = await prisma.itemReview.findFirst({
      where: {
        renterId,
        itemId,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found for this rental." },
        { status: 404 }
      );
    }

    // Update the review
    const updatedReview = await prisma.itemReview.update({
      where: { id: existingReview.id },
      data: { rating, comment },
    });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully.",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
