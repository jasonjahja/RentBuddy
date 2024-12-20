"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface RenterInfo {
  username: string;
  email: string;
  trust_score: number;
}

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
  const [renterInfo, setRenterInfo] = useState<RenterInfo | null>(null);

  useEffect(() => {
    const rentalIdRaw = params?.rentalId;
    const validRentalId = Array.isArray(rentalIdRaw) ? rentalIdRaw[0] : rentalIdRaw;
  
    if (!validRentalId || isNaN(parseInt(validRentalId, 10))) {
      setError("Invalid rental ID.");
      return;
    }
    setRentalId(parseInt(validRentalId, 10));
  
    async function fetchRenterAndReview(ownerId: number) {
      try {
        const rentalResponse = await fetch(`/api/rentals/${validRentalId}`);
        if (rentalResponse.ok) {
          const rentalData = await rentalResponse.json();
          const rental = rentalData.data;
  
          // Fetch renter information
          if (rental?.user) {
            const renter = rental.user;
            setRenterId(renter.id); // Assuming `id` is the renter ID
            setRenterInfo({
              username: renter.username,
              email: renter.email,
              trust_score: renter.trust_score,
            });
          }
  
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
  
    if (session?.user?.id) {
      const ownerId = Number(session.user.id);
      if (!isNaN(ownerId)) {
        setOwnerId(ownerId);
        fetchRenterAndReview(ownerId);
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full max-w-md" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative w-full max-w-md" role="alert">
          <strong className="font-bold">Success: </strong>
          <span className="block sm:inline">Review submitted successfully! Redirecting...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl overflow-hidden">
        <div className="bg-black text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="mr-4 text-yellow-400"><i className="fas fa-star"></i></span>
            Review Renter
          </h1>
        </div>
        <div className="flex flex-col md:flex-row">
          {/* Renter Information */}
          <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Renter Information</h2>
            {renterInfo ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{renterInfo.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{renterInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Trust Score</p>
                  <p className="font-medium">{renterInfo.trust_score}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading renter information...</p>
            )}
          </div>
          {/* Review Form */}
          <div className="md:w-2/3 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trust Score</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={trustScore}
                    onChange={(e) => setTrustScore(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-semibold text-black">{trustScore}</span>
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-black focus:border-black"
                  rows={4}
                  required
                  placeholder="Share your experience with this renter..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-full text-white transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    isSubmitting ? "bg-gray-400" : "bg-black hover:bg-gray-800"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">🔄</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✉️</span>
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

