import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { renterId, trustScore, comment, ownerId } = await req.json();

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

    if (!ownerId || typeof ownerId !== "number") {
      return NextResponse.json(
        { error: "Invalid ownerId. It must be a valid user ID." },
        { status: 400 }
      );
    }

    // Create a new renter review
    await prisma.renterReview.create({
      data: {
        comment,
        trustScore,
        renter: { connect: { id: renterId } }, // Connect to the renter being reviewed
        owner: { connect: { id: ownerId } },   // Connect to the owner giving the review
      },
    });

    // Calculate the updated trust score for the renter
    const avgTrustScoreResult = await prisma.renterReview.aggregate({
      _avg: { trustScore: true },
      where: { renterId },
    });

    // Handle undefined _avg
    const avgTrustScore = avgTrustScoreResult._avg?.trustScore || 0;

    // Update the renter's trust score in the `User` model
    await prisma.user.update({
      where: { id: renterId },
      data: { trust_score: Math.round(avgTrustScore) },
    });

    return NextResponse.json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
