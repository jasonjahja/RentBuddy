"use client";

import { useParams, useRouter } from "next/navigation";
import { items } from "../page";

export default function ItemDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const item = items.find(
    (i) => i.title.replace(/\s+/g, "-").toLowerCase() === slug
  );

  if (!item) {
    router.push("/404"); // Redirect to custom 404 page
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden p-6">
        {/* Image and Details Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image Section */}
          <div className="flex-shrink-0 w-full md:w-1/2 h-96 bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Item Details Section */}
          <div className="flex flex-col justify-between w-full md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
            <p className="text-gray-700 mb-4">{item.description}</p>
            <p className="text-2xl font-bold text-blue-500 mb-4">
              Price: ${item.price.toFixed(2)}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Go Back to Home
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Reviews:</h3>
          <div className="space-y-4">
            {item.reviews.map((review, index) => (
              <div
                key={index}
                className="border border-gray-200 p-4 rounded-lg bg-gray-50"
              >
                <p className="font-medium text-blue-500">{review.user}</p>
                <p className="text-gray-600">{review.comment}</p>
                <p className="text-sm text-yellow-500">
                  {"⭐".repeat(review.rating)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
