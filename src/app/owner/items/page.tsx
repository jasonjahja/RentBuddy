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
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-xl font-semibold text-gray-600">Loading session...</p>
    </div>;
  }

  if (status === "unauthenticated" || !session?.user?.id) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-xl font-semibold text-red-500">You must be logged in to view your items.</p>
    </div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-xl font-semibold text-gray-600">Loading...</p>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-xl font-semibold text-red-500">{error}</p>
    </div>;
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mt-16">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
            <button
              onClick={() => router.push("/owner/add-item")}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Add New Item
            </button>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 text-xl">No items found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link key={item.id} href={`/${item.slug}`} className="block">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                      <div className="relative h-48 w-full">
                        <Image
                          src={item.url}
                          alt={item.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="p-4">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 truncate">{item.title}</h2>
                        <p className="text-gray-600 text-sm mb-2 h-12 overflow-hidden">{item.description}</p>
                        <p className="text-blue-600 font-bold mb-2">
                          Rp {item.price.toLocaleString("id-ID")} / day
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            item.isAvailable ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Not Available"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}