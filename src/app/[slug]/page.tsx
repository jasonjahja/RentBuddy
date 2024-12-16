"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Review = {
  comment: string;
  rating: number;
  renter: {
    username: string;
  };
};

type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  url: string;
  owner: {
    username: string; // Owner's username
  };
  rentDuration?: number | null;
  itemReviews: Review[];
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState({
    visible: false,
    success: true,
    message: "",
  });

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await fetch(`/api/items?slug=${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch item");
        }
        const data = await response.json();
        setItem(data);

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
    try {
      const response = await fetch(`/api/items/${item?.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowResultModal({
          visible: true,
          success: true,
          message: "Item deleted successfully!",
        });
      } else {
        const errorData = await response.json();
        setShowResultModal({
          visible: true,
          success: false,
          message: errorData.error || "Failed to delete item",
        });
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      setShowResultModal({
        visible: true,
        success: false,
        message: "An unexpected error occurred while deleting the item.",
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    router.push(`/owner/edit-item/${item?.id}`);
  };

  const handleRentClick = () => {
    if (!session) {
      setShowLoginPopup(true);
    } else if (item && item.isAvailable) {
      router.push(`/rent/${slug}`);
    }
  };

  const handleClosePopup = () => setShowLoginPopup(false);

  const filteredReviews = filteredRating
    ? item?.itemReviews.filter((review) => review.rating === filteredRating)
    : item?.itemReviews;

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !item) {
    return <p>{error || "Item not found"}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-12 mt-14">
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
            {item.category && (
              <div className="mb-2">
                <span className="inline-block border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                  {item.category}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
            <p className="text-gray-700 mb-4">{item.description}</p>
            <p className="text-sm text-gray-500 mb-4">
              Owner:{" "}
              <span className="font-semibold text-gray-800">{item.owner.username}</span>
            </p>
            <p className="text-2xl font-bold text-blue-500 mb-4">
              Price: Rp {item.price.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
            </p>
            <p className={`font-semibold mb-4 ${item.isAvailable ? "text-green-500" : "text-red-500"}`}>
              {item.isAvailable ? "Available Now" : `Currently Rented (${item.rentDuration ?? "Unknown"} days remaining)`}
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

            {isOwner && (
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleEdit}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition w-52"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
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
          <div className="mb-4">
            <label htmlFor="filter" className="block font-medium mb-1">
              Filter by Rating:
            </label>
            <select
              id="filter"
              className="w-full border rounded-md px-4 py-2"
              onChange={(e) => setFilteredRating(e.target.value ? parseInt(e.target.value, 10) : null)}
            >
              <option value="">All Ratings</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 && "s"}
                </option>
              ))}
            </select>
          </div>
          <div className="h-96 overflow-y-auto bg-gray-100 rounded-md p-4">
            {filteredReviews && filteredReviews.length > 0 ? (
              <ul className="space-y-4">
                {filteredReviews.map((review, index) => (
                  <li key={index} className="bg-white p-4 rounded-md shadow">
                    <p className="font-semibold">{review.renter?.username}</p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2
              className={`text-lg font-bold mb-4 ${
                showResultModal.success ? "text-green-500" : "text-red-500"
              }`}
            >
              {showResultModal.success ? "Success" : "Error"}
            </h2>
            <p className="text-gray-600 mb-6">{showResultModal.message}</p>
            <button
              onClick={() => {
                setShowResultModal({ visible: false, success: true, message: "" });
                router.push("/"); // Redirect to the home page
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Log In Required
            </h2>
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
    </main>
  );
}
