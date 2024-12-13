import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE: Delete an item
export async function DELETE(
  req: Request,
) {
  const { itemId }  = await req.json()
  try {
    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

// PUT: Update an item
export async function PUT(
  req: Request
) {
  try {
    const body = await req.json();
    const { title, description, price, id } = body;

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id, 10) },
      data: { title, description, price },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item." },
      { status: 500 }
    );
  }
}
