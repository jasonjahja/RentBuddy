"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type Review = {
  user: string;
  comment: string;
  rating: number;
};

type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  url: string;
  rentDuration?: number | null;
  reviews: Review[];
};

export default function ItemDetailPage() {
  const slug = useParams()?.slug as string;
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await fetch(`/api/items?slug=${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch item");
        }
        const data = await response.json();
        setItem(data);
      } catch (err) {
        console.error((err as Error).message);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchItem();
    }
  }, [slug]);

  const handleRentClick = () => {
    if (item && item.isAvailable) {
      router.push(`/rent/${slug}`);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !item) {
    return <p>{error || "Item not found"}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 mt-14">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden p-6">
        {/* Back Button */}
        <div className="w-full max-w-5xl mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-800 px-4 py-2 rounded-md hover:text-gray-400 transition"
          >
            <i className="fas fa-angle-left"></i>
            Back
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image Section */}
          <div className="flex-shrink-0 w-full md:w-1/2 h-96 bg-gray-200 rounded-lg overflow-hidden relative">
            <Image
              src={item.url}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Item Details Section */}
          <div className="flex flex-col justify-between w-full md:w-1/2">
            {/* Category Badge */}
            {item.category && (
              <div className="mb-2">
                <span className="inline-block border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                  {item.category}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
            <p className="text-gray-700 mb-4">{item.description}</p>
            <p className="text-2xl font-bold text-blue-500 mb-4">
              Price: Rp{" "}
              {item.price.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
            </p>
            {/* Availability Status */}
            <p
              className={`font-semibold mb-4 ${
                item.isAvailable ? "text-green-500" : "text-red-500"
              }`}
            >
              {item.isAvailable
                ? "Available Now"
                : `Currently Rented (${item.rentDuration ?? "Unknown"} days remaining)`}
            </p>
            <button
              onClick={handleRentClick}
              disabled={!item.isAvailable}
              className={`px-6 py-2 rounded-md transition ${
                item.isAvailable
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
            >
              Rent
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Reviews:</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
            {item.reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col space-y-2"
              >
                <p className="font-semibold text-blue-500">{review.user}</p>
                <p className="text-gray-700 text-sm">{review.comment}</p>
                <p className="text-yellow-500 text-sm">
                  {"⭐".repeat(review.rating)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
