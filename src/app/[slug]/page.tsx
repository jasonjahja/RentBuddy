// pages/api/items.ts

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (req.method === "GET") {
    try {
      // Fetch a specific item if `slug` is provided
      if (slug) {
        if (typeof slug !== "string") {
          return res.status(400).json({ error: "Invalid slug format" });
        }

        const item = await prisma.item.findUnique({
          where: { slug },
          include: { reviews: true },
        });

        if (!item) {
          return res.status(404).json({ error: "Item not found" });
        }

        return res.status(200).json(item);
      }

      // Fetch all items if no `slug` is provided
      const items = await prisma.item.findMany({
        include: { reviews: true },
      });

      return res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      return res.status(500).json({ error: "Failed to fetch items" });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
