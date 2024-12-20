import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Assuming your auth method is compatible with App Router

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

    const body = await req.json();
    const { title, description, price, category, isAvailable, url } = body;

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        price,
        category,
        isAvailable: isAvailable ?? true,
        url: url ?? "/images/default.png",
        slug,
        owner: { connect: { id: Number(session.user.id) } },
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const userId = session.user.id

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      )
    }

    const items = await prisma.item.findMany({
      where: { ownerId: Number(userId) },
      include: { itemReviews: true },
    })

    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error("Error fetching owner items:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

