import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

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

    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        price,
        category,
        isAvailable: isAvailable ?? true,
        url: url ?? "/images/default.png",
        slug,
        owner: { connect: { id: Number(session.user.id) } }, // Automatically assign owner
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      const item = await prisma.item.findUnique({
        where: { slug },
        include: { reviews: true },
      });

      if (!item) {
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(item, { status: 200 });
    }

    const items = await prisma.item.findMany({
      include: { reviews: true },
    });

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error handling GET request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
