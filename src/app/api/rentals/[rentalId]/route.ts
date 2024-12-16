import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * GET /api/rentals/[rentalId]
 * Fetch rental details by rentalId.
 */
export async function GET(
  req: Request,
  { params }: { params: { rentalId: string } }
) {
  try {
    const rentalId = parseInt(params.rentalId, 10);

    // Validate rentalId
    if (isNaN(rentalId)) {
      return NextResponse.json(
        { error: "Invalid rental ID." },
        { status: 400 }
      );
    }

    // Fetch rental details
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        item: true, // Include associated item details
        user: true, // Include associated renter details
      },
    });

    // Handle not found
    if (!rental) {
      return NextResponse.json(
        { success: false, error: "Rental not found." },
        { status: 404 }
      );
    }

    // Return rental details
    return NextResponse.json({ success: true, data: rental }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rental:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
