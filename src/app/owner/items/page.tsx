"use client";

import { useEffect, useState } from "react";
import { Item } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OwnerItemsPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchOwnerItems(session.user.id);
    }
  }, [session, status]);

  async function fetchOwnerItems(ownerId: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/owner/items?ownerId=${ownerId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch owner items");
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (status === "unauthenticated" || !session?.user?.id) {
    return <p className="text-red-500">You must be logged in to view your items.</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Items</h1>
          <button
            onClick={() => router.push("/owner/add-item")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            + Add Item
          </button>
        </div>
        {items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link key={item.id} href={`/${item.slug}`} className="block">
                <div className="bg-white border rounded-lg p-4 shadow-md hover:shadow-lg transition">
                  <Image
                    src={item.url}
                    alt={item.title}
                    width={280}
                    height={240}
                    className="object-cover rounded-md mb-4"
                  />
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="text-blue-500 font-bold mt-2">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                  <p
                    className={`mt-2 ${
                      item.isAvailable ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Not Available"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
