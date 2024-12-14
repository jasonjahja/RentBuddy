"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function ReviewRenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const renterId = searchParams.get("renterId");

  const [trustScore, setTrustScore] = useState(50);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!renterId || isNaN(parseInt(renterId))) {
      setError("Invalid renter ID.");
    }
  }, [renterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    if (!renterId || isNaN(parseInt(renterId, 10))) {
      setError("Invalid renter ID.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/reviews/renter`, {
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
        setMessage("Review submitted successfully!");
        setTimeout(() => router.push("/owner/history"), 2000); // Redirect after 2 seconds
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || "Failed to submit review"}`);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setMessage("Error: Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg my-12">
        <h1 className="text-2xl font-bold text-center mb-6">Review Renter</h1>
        {message && (
          <p
            className={`text-center mb-4 ${
              message.startsWith("Error") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
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
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your feedback here..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/owner/history")}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              } font-semibold`}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
