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
    const { renterId, trustScore, comment, itemId } = body;

    console.log("Received Payload:", { renterId, trustScore, comment, itemId });

    // Validate input
    if (
      !renterId ||
      !itemId ||
      !comment ||
      trustScore < 0 ||
      trustScore > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input. Ensure renterId, trustScore (0-100), comment, and itemId are provided.",
        },
        { status: 400 }
      );
    }

    // Check if a review already exists for this renter and item
    const existingReview = await prisma.review.findFirst({
      where: {
        renterId,
        itemId,
      },
    });

    if (existingReview) {
      // Update the existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: { trustScore, comment },
      });

      // Update renter's trust score
      await updateRenterTrustScore(renterId);

      return NextResponse.json({
        success: true,
        message: "Review updated successfully.",
        data: updatedReview,
      });
    }

    // Create a new review
    const newReview = await prisma.review.create({
      data: {
        renterId,
        trustScore,
        comment,
        itemId,
      },
    });

    // Update renter's trust score
    await updateRenterTrustScore(renterId);

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
    const { reviewId, trustScore, comment } = body;

    if (!reviewId || trustScore < 0 || trustScore > 100 || !comment) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input. Ensure reviewId, trustScore (0-100), and comment are provided.",
        },
        { status: 400 }
      );
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { trustScore, comment },
    });

    // Update renter's trust score
    await updateRenterTrustScore(updatedReview.renterId);

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
  const renterId = searchParams.get("renterId");
  const itemId = searchParams.get("itemId");

  if (!renterId || !itemId) {
    return NextResponse.json(
      { success: false, error: "Valid renterId and itemId are required." },
      { status: 400 }
    );
  }

  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        renterId: parseInt(renterId, 10),
        itemId: parseInt(itemId, 10),
      },
      select: {
        id: true,
        renterId: true,
        trustScore: true,
        comment: true,
        createdAt: true,
      },
    });

    if (existingReview) {
      return NextResponse.json({ success: true, data: existingReview });
    }

    return NextResponse.json(
      { success: false, error: "No review found for this renter and item." },
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

// Helper function to update renter's trust score
async function updateRenterTrustScore(renterId: number) {
  const { _avg: { trustScore: avgTrustScore } = {} } =
    await prisma.review.aggregate({
      _avg: { trustScore: true },
      where: { renterId },
    });

  // Provide a fallback value of 0 if avgTrustScore is null
  const calculatedTrustScore = Math.round(avgTrustScore ?? 0);

  await prisma.user.update({
    where: { id: renterId },
    data: { trust_score: calculatedTrustScore },
  });
}
