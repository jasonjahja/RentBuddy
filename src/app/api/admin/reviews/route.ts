import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const reviews = await prisma.itemReview.findMany({
      include: {
        renter: true,
        item: true,
      },
    });

    if (!reviews) {
      return NextResponse.json(
        { error: "No reviews found." },
        { status: 404 }
      );
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
