import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const items = await prisma.item.findMany();
      return res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      return res.status(500).json({ error: "Failed to fetch items" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
