import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!ownerId) {
    return NextResponse.json(
      { success: false, error: "Owner ID is required" },
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
    const parsedOwnerId = parseInt(ownerId, 10);

    // Fetch rentals for items owned by the owner
    const rentals = await prisma.rental.findMany({
      where: { item: { ownerId: parsedOwnerId } },
      include: { item: true, user: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalRentals = await prisma.rental.count({
      where: { item: { ownerId: parsedOwnerId } },
    });

    return NextResponse.json({
      success: true,
      data: rentals,
      meta: {
        totalRentals,
        currentPage: page,
        totalPages: Math.ceil(totalRentals / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching rental history for ownerId=${ownerId}:`, error.message);
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
