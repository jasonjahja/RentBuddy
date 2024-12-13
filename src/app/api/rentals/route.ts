import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Use globalThis for Prisma client
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

// POST: Save rental data
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, itemId, startDate, endDate, totalCost } = body;

    if (
      !userId ||
      !itemId ||
      !startDate ||
      !endDate ||
      !totalCost ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate)) ||
      totalCost <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid input. Please check all fields." },
        { status: 400 }
      );
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    const rental = await prisma.rental.create({
      data: {
        userId: parsedUserId,
        itemId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalCost,
      },
    });

    return NextResponse.json({
      success: true,
      data: rental,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error saving rental:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    console.error("Unknown error saving rental:", error);
    return NextResponse.json(
      { success: false, error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

// GET: Fetch rental history for a user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return NextResponse.json(
      { success: false, error: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  try {
    // Fetch rentals for the user with pagination
    const parsedUserId = parseInt(userId, 10);

    const rentals = await prisma.rental.findMany({
      where: { userId: parsedUserId },
      include: { item: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalRentals = await prisma.rental.count({
      where: { userId: parsedUserId },
    });

    // Check if the user has reviewed each rental's item
    const rentalsWithReviews = await Promise.all(
      rentals.map(async (rental) => {
        const hasReviewed = await prisma.review.findFirst({
          where: {
            user: parsedUserId, // Ensure this is a number
            itemId: rental.itemId, // Check reviews for the item
          },
        });

        return {
          ...rental,
          hasReviewed: !!hasReviewed, // Add `hasReviewed` field
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: rentalsWithReviews,
      meta: {
        totalRentals,
        currentPage: page,
        totalPages: Math.ceil(totalRentals / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching rental history for userId=${userId}:`, error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    console.error("Unknown error fetching rental history:", error);
    return NextResponse.json(
      { success: false, error: "An unknown error occurred." },
      { status: 500 }
    );
  }
}
