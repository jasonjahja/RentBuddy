"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function ReviewRenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [renterId, setRenterId] = useState<string | null>(null);
  const [trustScore, setTrustScore] = useState(50);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  
  useEffect(() => {
    const renterIdFromParams = searchParams.get("renterId");
    console.log("Retrieved renterId:", renterIdFromParams);

    if (renterIdFromParams && !isNaN(parseInt(renterIdFromParams, 10))) {
      setRenterId(renterIdFromParams); // Set valid renterId
      setError(null); // Clear error
    } else {
      setError("Invalid or missing renter ID."); // Set error for invalid/missing renterId
    }
  }, [searchParams]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!renterId) {
      setError("Invalid renter ID.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/reviews/renter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          renterId: parseInt(renterId, 10),
          trustScore,
          comment,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/owner/history"), 2000);
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
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <p className="text-green-500">Review submitted successfully! Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Review Renter</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="trustScore" className="block text-sm font-medium text-gray-700">
              Trust Score (0-100)
            </label>
            <input
              id="trustScore"
              type="number"
              min="0"
              max="100"
              value={trustScore}
              onChange={(e) => setTrustScore(parseInt(e.target.value, 10))}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Write your feedback here..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/owner/history")}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                isSubmitting ? "opacity-50" : "hover:bg-blue-600"
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
