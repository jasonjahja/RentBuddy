"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ReviewRenterPage() {
  const router = useRouter();
  const params = useParams();
  const renterId = params?.renterId as string; // Explicitly assert renterId as a string
  const { data: session } = useSession();

  const [trustScore, setTrustScore] = useState<number>(50); // Default trust score
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    async function fetchExistingRenterReview() {
      try {
        if (!renterId || !session?.user?.id) {
          console.error("Missing renterId or userId");
          return;
        }

        const response = await fetch(
          `/api/reviews/renter?${renterId}&ownerId=${session.user.id}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch renter review");
        }

        const { success, data } = await response.json();

        if (success && data) {
          console.log("Fetched renter review:", data);
          setTrustScore(data.trustScore);
          setComment(data.comment);
          setIsEditMode(true);
        } else {
          console.log("No review found for renterId:", renterId);
        }
      } catch (err) {
        console.error("Error fetching renter review:", err);
      }
    }

    if (session?.user?.id && renterId) {
      fetchExistingRenterReview();
    }
  }, [renterId, session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (trustScore < 0 || trustScore > 100) {
      setError("Please provide a trust score between 0 and 100.");
      return;
    }

    try {
      const response = await fetch("/api/reviews/renter", {
        method: isEditMode ? "PUT" : "POST", // Use PUT for edit mode
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerId: session?.user?.id, // Current owner submitting the review
          renterId: parseInt(renterId, 10), // Renter being reviewed
          trustScore,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit renter review");
      }

      setSuccess(true);
      setTimeout(() => router.push("/owner/rentals"), 2000); // Redirect to rentals
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {isEditMode ? "Edit Renter Review" : "Leave a Review for Renter"}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success ? (
          <p className="text-green-500">
            {isEditMode
              ? "Review updated successfully!"
              : "Thank you for your review!"}{" "}
            Redirecting...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="trustScore" className="block text-gray-700 font-medium mb-2">
                Trust Score (0-100):
              </label>
              <input
                id="trustScore"
                type="number"
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={trustScore}
                onChange={(e) => setTrustScore(Math.min(Math.max(Number(e.target.value), 0), 100))}
                required
              />
              <small className="text-gray-500">Higher scores indicate more trustworthiness.</small>
            </div>

            <div>
              <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                Comment:
              </label>
              <textarea
                id="comment"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback about the renter here..."
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/owner/rentals")}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
              >
                {isEditMode ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
