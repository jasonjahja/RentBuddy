"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Rental = {
  id: number;
  item: {
    title: string;
    description: string;
    url: string;
    price: number;
  };
  startDate: string;
  endDate: string;
  totalCost: number;
  hasReviewed: boolean; // Indicates if the user has left a review
};

export default function HistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(`/api/rentals?userId=${session?.user?.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch rental history");
        }
        const result = await response.json();
        console.log("Fetched rentals:", result.data); // Debug response
        if (Array.isArray(result.data)) {
          setRentals(result.data);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchHistory();
    }
  }, [session?.user?.id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Rental History</h1>
        {rentals.length === 0 ? (
          <p className="text-gray-600">No rental history found.</p>
        ) : (
          <div className="space-y-6">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="p-4 bg-blue-50 rounded-lg shadow-md flex items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={rental.item.url}
                    alt={rental.item.title}
                    width={148}
                    height={148}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {rental.item.title}
                    </h2>
                    <p className="text-gray-600">
                      Rental Period:{" "}
                      <span className="font-semibold">
                        {new Date(rental.startDate).toLocaleDateString()} -{" "}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-blue-700 font-bold">
                      Total Cost: Rp {rental.totalCost.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    router.push(
                      `/leave-review/${rental.id}?edit=${rental.hasReviewed}`
                    )
                  }
                  className={`px-4 py-2 ${
                    rental.hasReviewed
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white rounded-md transition`}
                >
                  {rental.hasReviewed ? "Edit Review" : "Leave a Review"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
