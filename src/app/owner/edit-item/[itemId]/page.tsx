"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function fetchItemDetails() {
      try {
        const response = await fetch(`/api/items/${itemId}`);
        if (!response.ok) throw new Error("Failed to fetch item details");
  
        const data = await response.json();
        console.log("Fetched item details:", data);
  
        setTitle(data?.title || "");
        setDescription(data?.description || "");
        setPrice(formatIDR(String(data?.price || 0)));
        setCategory(data?.category || "");
        setIsAvailable(data?.isAvailable ?? true); // Default to true if undefined
        setImagePreview(data?.url || null);
  
        // Update categories if the item's category is not in the list
        if (data?.category && !categories.includes(data.category)) {
          setCategories((prevCategories) => [...prevCategories, data.category]);
        }
      } catch (err) {
        console.error("Error fetching item details:", err);
        setError("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    }
  
    if (itemId) fetchItemDetails();
  }, [itemId, categories]);
  

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
          url: imagePreview,
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
      setCategories(prevCategories => [...prevCategories, category]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl mt-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>
        {success && (
          <div className="mb-4 p-4 rounded-md bg-green-100 text-green-700">
            Item updated successfully! Redirecting...
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 flex items-stretch">
            <div
              className={`w-full mb-6 flex flex-col justify-center ${
                imagePreview ? "h-60" : "h-full"
              }`}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div
                className={`mt-1 flex justify-center px-6 py-16 border-2 border-gray-300 border-dashed rounded-md h-full ${
                  imagePreview ? "bg-gray-50" : ""
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                    e.dataTransfer.clearData();
                  }
                }}
              >
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      width={300}
                      height={300}
                      className="mx-auto h-60 w-60 object-cover rounded-md"
                    />
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-gray-600 flex">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleImageUpload}
                            accept="image/*"
                          />
                        </label>
                        <p className="ml-1">or drag and drop your file here</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col justify-between space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
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
                  placeholder="New category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price per Day (in IDR)
              </label>
              <input
                id="price"
                type="text"
                value={price}
                onChange={handlePriceChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="isAvailable" className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 block text-sm text-gray-900">Available</span>
              </label>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

