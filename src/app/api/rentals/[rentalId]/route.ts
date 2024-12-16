import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * GET /api/rentals/[rentalId]
 * Fetch rental details by rentalId.
 */
export async function GET(req: Request) {
  try {
    // Extract the 'rentalId' parameter from the URL
    const url = new URL(req.url);
    const rentalId = url.pathname.split('/').pop(); // Extract the last part of the URL

    // Validate the 'rentalId' parameter
    const parsedRentalId = parseInt(rentalId || "", 10);
    if (isNaN(parsedRentalId)) {
      return NextResponse.json(
        { error: "Invalid or missing rental ID. Must be a valid number." },
        { status: 400 }
      );
    }

    // Fetch the rental details from the database
    const rental = await prisma.rental.findUnique({
      where: { id: parsedRentalId },
      include: {
        item: true, // Include associated item details
        user: true, // Include associated renter details
      },
    });

    // Handle rental not found
    if (!rental) {
      return NextResponse.json(
        { success: false, error: "Rental not found." },
        { status: 404 }
      );
    }

    // Return rental details as JSON
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
