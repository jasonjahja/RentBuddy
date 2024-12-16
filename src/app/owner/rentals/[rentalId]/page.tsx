"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ReviewRenterPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  // State declarations
  const [rentalId, setRentalId] = useState<number | null>(null);
  const [renterId, setRenterId] = useState<number | null>(null);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [trustScore, setTrustScore] = useState<number>(50);
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const rentalIdRaw = params?.rentalId;
    const validRentalId = Array.isArray(rentalIdRaw) ? rentalIdRaw[0] : rentalIdRaw;
  
    if (!validRentalId || isNaN(parseInt(validRentalId, 10))) {
      setError("Invalid rental ID.");
      return;
    }
    setRentalId(parseInt(validRentalId, 10));
  
    // Function to fetch renterId and review after session has loaded
    async function fetchRenterAndReview(ownerId: number) {
      try {
        // Fetch rental details to get renterId
        const rentalResponse = await fetch(`/api/rentals/${validRentalId}`);
        if (rentalResponse.ok) {
          const rentalData = await rentalResponse.json();
          setRenterId(rentalData.data.userId);
  
          // Fetch existing review if available
          const reviewResponse = await fetch(
            `/api/reviews/renter?rentalId=${validRentalId}&renterId=${rentalData.data.userId}&ownerId=${ownerId}`
          );
  
          if (reviewResponse.ok) {
            const reviewData = await reviewResponse.json();
            if (reviewData.success && reviewData.data) {
              setTrustScore(reviewData.data.trustScore);
              setComment(reviewData.data.comment);
            }
          }
        } else {
          setError("Failed to fetch rental details.");
        }
      } catch (err) {
        console.error("Error fetching renter and review details:", err);
        setError("An unexpected error occurred.");
      }
    }
  
    // Fetch session to get ownerId
    if (session?.user?.id) {
      const ownerId = Number(session.user.id);
      if (!isNaN(ownerId)) {
        setOwnerId(ownerId);
        fetchRenterAndReview(ownerId); // Only call fetch after ownerId is set
      } else {
        setError("Invalid owner ID format.");
      }
    }
  }, [params, session]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentalId || !ownerId || !renterId) {
      setError("Missing required data.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews/renter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId,
          renterId,
          ownerId,
          trustScore,
          comment,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/owner/rentals"), 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500">{error}</div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-green-500">Review submitted successfully! Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Review Renter</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Trust Score (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={trustScore}
              onChange={(e) => setTrustScore(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full border rounded px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded px-4 py-2"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white ${
                isSubmitting ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
