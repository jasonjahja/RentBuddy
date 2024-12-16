import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * POST /api/reviews/renter
 * Create or update a renter review and update the renter's trust score.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { renterId, ownerId, rentalId, trustScore, comment } = body;

    if (
      !renterId ||
      !ownerId ||
      !rentalId ||
      trustScore === undefined ||
      !comment
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Check if a review already exists
    const existingReview = await prisma.renterReview.findFirst({
      where: { renterId, ownerId },
    });

    let response;
    if (existingReview) {
      // Update the existing review
      response = await prisma.renterReview.update({
        where: { id: existingReview.id },
        data: {
          trustScore,
          comment,
        },
      });
    } else {
      // Create a new review
      response = await prisma.renterReview.create({
        data: {
          renterId,
          ownerId,
          trustScore,
          comment,
        },
      });
    }

    // Fetch the current trust score from the User table
    const renter = await prisma.user.findUnique({
      where: { id: renterId },
      select: { trust_score: true },
    });

    if (!renter || renter.trust_score === null) {
      return NextResponse.json(
        { error: "Renter does not have an existing trust score." },
        { status: 400 }
      );
    }

    // Calculate the new trust score by averaging the existing score and the new score
    const newTrustScore = Math.round((renter.trust_score + trustScore) / 2);

    // Update the trust score in the User table
    await prisma.user.update({
      where: { id: renterId },
      data: { trust_score: newTrustScore },
    });

    return NextResponse.json(
      {
        success: true,
        data: response,
        updatedTrustScore: newTrustScore,
      },
      { status: existingReview ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error submitting review and updating trust score:", error);
    return NextResponse.json(
      { error: "Failed to submit review and update trust score." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


/**
 * GET /api/reviews/renter
 * Fetch an existing renter review for a given rentalId, renterId, and ownerId.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rentalId = searchParams.get("rentalId");
    const renterId = searchParams.get("renterId");
    const ownerId = searchParams.get("ownerId");

    // Validate query parameters
    if (!rentalId || isNaN(Number(rentalId))) {
      return NextResponse.json(
        { error: "Invalid or missing rentalId in query parameters." },
        { status: 400 }
      );
    }
    if (!renterId || isNaN(Number(renterId))) {
      return NextResponse.json(
        { error: "Invalid or missing renterId in query parameters." },
        { status: 400 }
      );
    }
    if (!ownerId || isNaN(Number(ownerId))) {
      return NextResponse.json(
        { error: "Invalid or missing ownerId in query parameters." },
        { status: 400 }
      );
    }

    // Fetch the renter review
    const existingReview = await prisma.renterReview.findFirst({
      where: {
        renterId: Number(renterId),
        ownerId: Number(ownerId),
      },
    });

    // If no review is found, return a success with no data
    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "No existing review found." },
        { status: 200 }
      );
    }

    // Return the existing review
    return NextResponse.json({ success: true, data: existingReview }, { status: 200 });
  } catch (error) {
    console.error("Error fetching renter review:", error);
    return NextResponse.json(
      { error: "Failed to fetch renter review." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}