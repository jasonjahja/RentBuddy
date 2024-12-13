"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LeaveReviewPage() {
  const router = useRouter();
  const params = useParams();
  const rentalId = params?.rentalId as string; // Explicitly assert rentalId as a string
  const { data: session } = useSession();

  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    async function fetchExistingReview() {
      try {
        const response = await fetch(
          `/api/reviews?rentalId=${rentalId}&userId=${session?.user?.id}`
        );
        if (response.ok) {
          const { success, data } = await response.json();
          if (success && data) {
            setRating(data.rating);
            setReviewText(data.comment);
            setIsEditMode(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch existing review:", err);
      }
    }

    if (session?.user?.id && rentalId) {
      fetchExistingReview();
    }
  }, [rentalId, session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: isEditMode ? "PUT" : "POST", // Use PUT for edit mode
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          name: session?.user?.username, // Include the user's name
          rentalId: parseInt(rentalId, 10),
          rating,
          comment: reviewText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      setSuccess(true);
      setTimeout(() => router.push("/history"), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {isEditMode ? "Edit Review" : "Leave a Review"}
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
              <label htmlFor="rating" className="block text-gray-700 font-medium mb-2">
                Rating (1-5):
              </label>
              <select
                id="rating"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value="">Select a rating</option>
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} Star{star > 1 && "s"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="review" className="block text-gray-700 font-medium mb-2">
                Review:
              </label>
              <textarea
                id="review"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/history")}
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
    </div>
  );
}
