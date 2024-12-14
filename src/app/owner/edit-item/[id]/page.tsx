"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.itemId as string; // Explicitly assert itemId as a string

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [url, setUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function fetchItemDetails() {
      try {
        const response = await fetch(`/api/items/${itemId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch item details");
        }

        const data = await response.json();

        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setCategory(data.category);
        setIsAvailable(data.isAvailable);
        setUrl(data.url);
      } catch (err) {
        console.error("Error fetching item details:", err);
        setError("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    }

    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price || !category) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price,
          category,
          isAvailable,
          url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update item");
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 2000); // Redirect after success
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Item</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && (
          <p className="text-green-500">Item updated successfully! Redirecting...</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Title:
            </label>
            <input
              type="text"
              id="title"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description:
            </label>
            <textarea
              id="description"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
              Price (Rp):
            </label>
            <input
              type="number"
              id="price"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
              Category:
            </label>
            <input
              type="text"
              id="category"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="isAvailable" className="block text-gray-700 font-medium mb-2">
              Available:
            </label>
            <input
              type="checkbox"
              id="isAvailable"
              className="mr-2"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <span>{isAvailable ? "Yes" : "No"}</span>
          </div>

          <div>
            <label htmlFor="url" className="block text-gray-700 font-medium mb-2">
              Image URL:
            </label>
            <input
              type="text"
              id="url"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
