import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { ownerId } = req.query;

    const parsedOwnerId = parseInt(ownerId as string, 10);
    if (isNaN(parsedOwnerId)) {
      return res.status(400).json({ error: "Invalid owner ID" });
    }

    if (req.method === "GET") {
      const items = await prisma.item.findMany({
        where: { ownerId: parsedOwnerId },
        include: { reviews: true },
      });

      return res.status(200).json(items);
    }

    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error fetching owner items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
