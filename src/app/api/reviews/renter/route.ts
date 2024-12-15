import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Replace with your actual auth import

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { renterId, trustScore, comment } = await req.json();
    const ownerId = parseInt(session.user.id, 10);

    // Validate input
    if (!renterId || typeof renterId !== "number") {
      return NextResponse.json(
        { error: "Invalid renterId. It must be a valid user ID." },
        { status: 400 }
      );
    }

    if (typeof trustScore !== "number" || trustScore < 0 || trustScore > 100) {
      return NextResponse.json(
        { error: "Invalid trustScore. It must be a number between 0 and 100." },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string") {
      return NextResponse.json(
        { error: "Invalid comment. It must be a non-empty string." },
        { status: 400 }
      );
    }

    // Validate renterId and ownerId existence
    const renterExists = await prisma.user.findUnique({
      where: { id: renterId },
    });
    if (!renterExists) {
      return NextResponse.json(
        { error: "Renter does not exist." },
        { status: 404 }
      );
    }

    const ownerExists = await prisma.user.findUnique({
      where: { id: ownerId },
    });
    if (!ownerExists) {
      return NextResponse.json(
        { error: "Owner does not exist." },
        { status: 404 }
      );
    }

    // Check for duplicate reviews
    const existingReview = await prisma.renterReview.findFirst({
      where: {
        renterId,
        ownerId,
      },
    });
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this renter." },
        { status: 400 }
      );
    }

    // Create review and update trust score in a transaction
    const avgTrustScoreResult = await prisma.$transaction([
      prisma.renterReview.create({
        data: {
          comment,
          trustScore,
          renter: { connect: { id: renterId } },
          owner: { connect: { id: ownerId } },
        },
      }),
      prisma.renterReview.aggregate({
        _avg: { trustScore: true },
        where: { renterId },
      }),
    ]);

    const avgTrustScore = avgTrustScoreResult[1]._avg?.trustScore || 0;

    // Update the renter's trust score
    await prisma.user.update({
      where: { id: renterId },
      data: { trust_score: Math.round(avgTrustScore) },
    });

    return NextResponse.json({
      message: "Review submitted successfully.",
      updatedTrustScore: Math.round(avgTrustScore),
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
