import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // Safely extract the `slug` parameter from the query
      const slug = req.query.slug;

      if (slug) {
        // Validate the `slug` format
        if (typeof slug !== "string") {
          return res.status(400).json({ error: "Invalid slug format" });
        }

        // Fetch a single item by slug
        const item = await prisma.item.findUnique({
          where: { slug },
          include: { reviews: true },
        });

        if (!item) {
          return res.status(404).json({ error: "Item not found" });
        }

        return res.status(200).json(item);
      }

      // Fetch all items if no slug is provided
      const items = await prisma.item.findMany({
        include: { reviews: true },
      });

      return res.status(200).json(items);
    } else if (req.method === "POST") {
      const { title, description, price, category, isAvailable, url } = req.body;

      // Validate the required fields
      if (!title || !description || !price || !category) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Generate a slug from the title
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

      // Add the new item to the database
      const newItem = await prisma.item.create({
        data: {
          title,
          description,
          price,
          category,
          isAvailable: isAvailable ?? true, // Default to true if not provided
          url: url ?? "/images/default.png", // Default to a placeholder image if not provided
          slug,
        },
      });

      return res.status(201).json(newItem);
    } else {
      // Handle unsupported methods
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
