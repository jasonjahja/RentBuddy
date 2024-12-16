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
      // Update the existing review
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

// GET: Fetch the review for a rental
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
    // Fetch the rental details to get itemId and renterId
    const rental = await prisma.rental.findUnique({
      where: { id: parsedRentalId },
      include: {
        item: true,
        user: true, // Includes renter information
      },
    });

    if (!rental) {
      return NextResponse.json(
        { success: false, error: "Rental not found." },
        { status: 404 }
      );
    }

    // Use itemId and renterId from the rental to fetch the review
    const existingReview = await prisma.itemReview.findFirst({
      where: {
        renterId: rental.userId,
        itemId: rental.itemId,
      },
      include: {
        renter: {
          select: { username: true }, // Include renter's username
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({
        success: true,
        data: {
          ...existingReview,
          renterName: existingReview.renter?.username || rental.user?.username || null,
        },
      });
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
        {
          success: true, // Treat as a successful response
          data: null,    // Indicate no data was found
          message: "No review found for this rental.",
        },
        { status: 200 }  // Return 200 OK
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