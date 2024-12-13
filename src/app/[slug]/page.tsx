"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Review = {
  name: string;
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
  ownerId: string;
  rentDuration?: number | null;
  reviews: Review[];
};

export default function ItemDetailPage() {
  const slug = useParams()?.slug as string;
  const router = useRouter();
  const { data: session } = useSession();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [filteredRating, setFilteredRating] = useState<number | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await fetch(`/api/items?slug=${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch item");
        }
        const data = await response.json();
        setItem(data);

        // Set isOwner only if the session exists
        if (session?.user?.id && String(data.ownerId) === String(session.user.id)) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchItem();
    }
  }, [slug, session?.user?.id]);

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/items/${item?.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Item deleted successfully!");
          router.push("/"); // Redirect to owner's page after deletion
        } else {
          const errorData = await response.json();
          alert(`Failed to delete item: ${errorData.error || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Error deleting item:", err);
        alert("An unexpected error occurred while deleting the item.");
      }
    }
  };

  const handleEdit = () => {
    // Navigate to the dynamic route `/owner/edit-item/[itemId]`
    router.push(`/owner/edit-item/${item?.id}`);
  };

  const handleRentClick = () => {
    if (!session) {
      // Show the login popup if the user is not logged in
      setShowLoginPopup(true);
    } else if (item && item.isAvailable) {
      // Proceed with navigation if the user is logged in
      router.push(`/rent/${slug}`);
    }
  };
  
  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };

  const filteredReviews = filteredRating
    ? item?.reviews.filter((review) => review.rating === filteredRating)
    : item?.reviews;

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
            {!isOwner && (
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
            )}

            {/* Owner Actions */}
            {isOwner && (
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleEdit}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition w-52"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition w-52"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          {/* Filter Section */}
          <div className="mb-4">
            <label htmlFor="filter" className="block font-medium mb-1">
              Filter by Rating:
            </label>
            <select
              id="filter"
              className="w-full border rounded-md px-4 py-2"
              onChange={(e) =>
                setFilteredRating(
                  e.target.value ? parseInt(e.target.value, 10) : null
                )
              }
            >
              <option value="">All Ratings</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 && "s"}
                </option>
              ))}
            </select>
          </div>
          {/* Scrollable Reviews */}
          <div className="h-96 overflow-y-auto bg-gray-100 rounded-md p-4">
            {filteredReviews && filteredReviews.length > 0 ? (
              <ul className="space-y-4">
                {filteredReviews.map((review, index) => (
                  <li key={index} className="bg-white p-4 rounded-md shadow">
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-yellow-500">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                    <p className="text-gray-700">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews available for the selected rating.</p>
            )}
          </div>
        </div>
      </div>
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Log In Required</h2>
            <p className="text-gray-600 mb-6">
              To rent this item, please log in or sign up for an account.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("auth/login")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Log In
              </button>
              <button
                onClick={handleClosePopup}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
