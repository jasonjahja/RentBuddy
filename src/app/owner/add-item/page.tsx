"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AddItem() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>(["Outdoor", "Electronics", "Home", "Transport"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const numericPrice = parseFloat(price.replace(/[^\d]/g, ""));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setMessage("Error: Price must be a positive number.");
      setIsSubmitting(false);
      return;
    }

    if (!category) {
      setMessage("Error: Please select a category or add a new one.");
      setIsSubmitting(false);
      return;
    }

    if (!imagePreview) {
      setMessage("Error: Please upload an image for the product.");
      setIsSubmitting(false);
      return;
    }

    const newItem = {
      title: productName.trim(),
      description: description.trim(),
      price: numericPrice,
      category,
      isAvailable: true,
      url: imagePreview,
    };

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        setMessage("Product added successfully!");
        setProductName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setRecommendedPrice(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        router.push("/");
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || "Unable to add product."}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Error: Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);

    if (selectedCategory) {
      try {
        const response = await fetch(`/api/recommendations?category=${selectedCategory}`);
        if (response.ok) {
          const { recommendedPrice } = await response.json();
          setRecommendedPrice(recommendedPrice || null);
        } else {
          setRecommendedPrice(null);
        }
      } catch (err) {
        console.error("Error fetching recommended price:", err);
        setRecommendedPrice(null);
      }
    } else {
      setRecommendedPrice(null);
    }
  };

  const handleCategoryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value.trim());
    setRecommendedPrice(null);
  };

  const handleAddCategory = () => {
    if (category && !categories.includes(category)) {
      setCategories((prevCategories) => [...prevCategories, category]);
      setCategory("");
    } else if (!category) {
      setMessage("Error: Please enter a valid category.");
    }
  };

  const formatIDR = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPrice = formatIDR(e.target.value);
    setPrice(formattedPrice ? `Rp ${formattedPrice}` : "");
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-12 mt-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>
        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.startsWith("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 flex items-stretc">
            <div
            className={`w-full mb-6 flex flex-col justify-center h-full`}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div
                className={`mt-1 flex justify-center px-6 py-16 border-2 border-gray-300 border-dashed rounded-md h-full ${
                  imagePreview ? "bg-gray-50" : ""
                }`}
                onDragOver={(e) => e.preventDefault()} // Allow dropping
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                
                    // Clear the DataTransfer object
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
                      
                    </>
                  )}
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
                            ref={fileInputRef}
                            accept="image/*"
                          />
                        </label>
                        <p className="ml-1">or drag and drop your file here</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col justify-between space-y-6">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
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
                  onChange={handleCategoryChange}
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
                  onChange={handleCategoryInput}
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
                onChange={handlePriceInput}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {recommendedPrice && (
                <p className="mt-2 text-sm text-gray-500">
                  Recommended Price: Rp {recommendedPrice.toLocaleString("id-ID")}
                </p>
              )}
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
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Adding..." : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

