"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.itemId as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>(""); // Formatted price as string
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "Outdoor",
    "Electronics",
    "Home",
    "Transport",
  ]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [url, setUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function fetchItemDetails() {
      try {
        const response = await fetch(`/api/items/${itemId}`);
        if (!response.ok) throw new Error("Failed to fetch item details");

        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setPrice(formatIDR(String(data.price)));
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

    if (itemId) fetchItemDetails();
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !category) {
      setError("All fields are required.");
      return;
    }

    const numericPrice = parseFloat(price.replace(/[^\d]/g, "")); // Convert formatted price back to a number

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: numericPrice,
          category,
          isAvailable,
          url,
        }),
      });

      if (!response.ok) throw new Error("Failed to update item");

      setSuccess(true);
      setTimeout(() => router.push("/"), 2000); // Redirect after success
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const formatIDR = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, ""); // Remove non-numeric characters
    return `Rp ${numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`; // Format with thousands separator
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(formatIDR(e.target.value));
  };

  const handleAddCategory = () => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
      setCategory(""); // Reset input
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Item</h1>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
              Category:
            </label>
            <div className="flex gap-2">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-2/3 border px-4 py-2 rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Add new category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-1/3 border px-4 py-2 rounded-md"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description:
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border px-4 py-2 rounded-md"
            ></textarea>
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
              Price (Rp):
            </label>
            <input
              type="text"
              id="price"
              value={price}
              onChange={handlePriceChange}
              className="w-full border px-4 py-2 rounded-md"
              placeholder="Rp 0"
            />
          </div>

          <div>
            <label htmlFor="isAvailable" className="block text-gray-700 font-medium mb-2">
              Available:
            </label>
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="mr-2"
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
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border px-4 py-2 rounded-md"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
