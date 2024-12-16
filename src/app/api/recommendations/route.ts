import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    // Fetch all items in the specified category
    const itemsInCategory = await prisma.item.findMany({
      where: { category },
      select: { price: true }, // Only fetch the price field
    });

    if (itemsInCategory.length === 0) {
      return NextResponse.json(
        { recommendedPrice: 0, message: "No items found in this category." },
        { status: 200 }
      );
    }

    // Calculate average price
    const totalPrices = itemsInCategory.reduce((sum, item) => sum + item.price, 0);
    const averagePrice = Math.round(totalPrices / itemsInCategory.length);

    // Return the recommended price
    return NextResponse.json(
      { recommendedPrice: averagePrice },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendation." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
