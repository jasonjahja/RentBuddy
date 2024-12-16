import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all RenterReviews with associated renter and owner details
    const reviews = await prisma.renterReview.findMany({
      include: {
        renter: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Handle no reviews found
    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: "No renter reviews found." },
        { status: 404 }
      );
    }

    // Return fetched reviews
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error("Error fetching renter reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch renter reviews." },
      { status: 500 }
    );
  }
}
