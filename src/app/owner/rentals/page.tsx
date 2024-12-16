"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Rental = {
  id: number;
  startDate: string;
  endDate: string;
  totalCost: number;
  item: {
    id: number;
    title: string;
    description: string;
    url: string;
    price: number;
  };
  user: {
    id: number; // Renter's ID
    username: string;
    email: string;
  };
};

export default function OwnerHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOwnerHistory() {
      try {
        if (!session?.user?.id) {
          setError("You must be logged in to view this page.");
          return;
        }

        // Fetch rentals where the ownerId matches the logged-in user's ID
        const response = await fetch(`/api/rentals/owner?ownerId=${session.user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch rental history for owner");
        }

        const result = await response.json();
        console.log("Fetched rentals for owner:", result.data); // Debug response

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
      fetchOwnerHistory();
    }
  }, [session?.user?.id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Rental History (Owner)</h1>
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
                    src={rental.item.url || "/images/default.png"} // Default image fallback
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
                      Rented by:{" "}
                      <span className="font-semibold">{rental.user.username}</span> (
                      {rental.user.email})
                    </p>
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
                {/* Updated Button with Yellow Color and Text */}
                <button
                  onClick={() => router.push(`/owner/rentals/${rental.id}`)}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition"
                >
                  Edit Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
