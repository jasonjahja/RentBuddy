"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Review = {
  comment: string;
  rating: number;
  createdAt: Date;
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

  // Add this after the existing state declarations
  const averageRating = item?.itemReviews.length
    ? item.itemReviews.reduce((acc, review) => acc + review.rating, 0) / item.itemReviews.length
    : 0;


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
    <main className="min-h-screen bg-white flex flex-col items-center py-12 mt-20">
      <div className="w-full max-w-7xl px-4">

        {/* Back button and Breadcrumb */}
        <button onClick={() => router.back()} className="flex items-center mb-8 text-gray-600 hover:text-gray-800 transition-colors duration-200">
          <i className="fas fa-angle-left mr-3"></i>
          <div className="text-xl text-gray-600">
            Back to Browse
          </div>
        </button>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Image Section */}
          <div className="flex-1">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={item.url}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-600">
              {item.category} / {item.title}
            </div>
            <h1 className="text-4xl font-bold">{item.title}</h1>

            {/* Price Section */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
              {item.isAvailable && (
                <span className="px-2 py-1 text-xs bg-black text-white rounded">
                  Available
                </span>
              )}
            </div>

            {/* Reviews Summary */}
            {item.itemReviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-400">
                  {Array.from({ length: 5 }, (_, index) => (
                    <i
                      key={index}
                      className={
                        index < Math.floor(averageRating)
                          ? "fas fa-star"
                          : "far fa-star"
                      }
                    ></i>
                  ))}
                </div>
                <span className="text-gray-600">
                  ({item.itemReviews.length} Reviews)
                </span>
              </div>
            )}


            {/* Description */}
            <div className="space-y-2 h-48">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="text-gray-600">{item.description}</p>
            </div>

            {/* Owner Info */}
            <div className="text-sm text-gray-600">
              Listed by: <span className="font-medium">{item.owner.username}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex pt-6">
              {!isOwner && (
                <button
                  onClick={handleRentClick}
                  disabled={!item.isAvailable}
                  className={`flex-1 px-6 py-3 rounded-lg text-center transition ${
                    item.isAvailable
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {item.isAvailable ? "Rent Now" : "Not Available"}
                </button>
              )}
              {isOwner && (
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex-1 px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-3">{averageRating.toFixed(1)}</span>
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }, (_, index) => (
                <i
                  key={index}
                  className={
                    index < Math.floor(averageRating)
                      ? "fas fa-star"
                      : "far fa-star"
                  }
                ></i>
              ))}
            </div>
          </div>
            <div className="flex items-center">
              <label htmlFor="filter" className="mr-2 text-sm font-medium text-gray-700">
                Filter by:
              </label>
              <select
                id="filter"
                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                onChange={(e) => setFilteredRating(e.target.value ? parseInt(e.target.value, 10) : null)}
              >
                <option value="">All Ratings</option>
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>
                    {star} Star{star > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-6">
            {filteredReviews && filteredReviews.length > 0 ? (
              filteredReviews.map((review, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <span className="text-xl font-semibold text-gray-600">
                          {review.renter?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{review.renter?.username}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }, (_, index) => (
                        <i
                          key={index}
                          className={
                            index < review.rating
                              ? "fas fa-star"
                              : "far fa-star"
                          }
                        ></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No reviews available for the selected rating.</p>
              </div>
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

