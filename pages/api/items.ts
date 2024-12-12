import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../src/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
      }

      const { title, description, price, category, isAvailable, url } = req.body;

      if (!title || !description || !price || !category) {
        return res.status(400).json({ error: "All fields are required" });
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
          owner: { connect: { id: Number(session.user.id) } }, // Automatically assign owner
        },
      });

      return res.status(201).json(newItem);
    } else if (req.method === "GET") {
      const slug = req.query.slug;

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

      const items = await prisma.item.findMany({
        include: { reviews: true },
      });

      return res.status(200).json(items);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
