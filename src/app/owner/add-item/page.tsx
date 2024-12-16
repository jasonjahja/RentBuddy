"use client";

import { useState } from "react";

export default function AddItem() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null); // Recommended price
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>(["Outdoor", "Electronics", "Home", "Transport"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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

    const newItem = {
      title: productName.trim(),
      description: description.trim(),
      price: numericPrice,
      category,
      isAvailable: true,
      url: "/images/bike.webp", // Default image
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
        setRecommendedPrice(null); // Reset recommended price
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

    // Fetch the recommended price for the selected category
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
    setRecommendedPrice(null); // Reset recommended price when adding a new category
  };

  const handleAddCategory = () => {
    if (category && !categories.includes(category)) {
      setCategories((prevCategories) => [...prevCategories, category]);
      setCategory(""); // Clear input after adding
    } else if (!category) {
      setMessage("Error: Please enter a valid category.");
    }
  };

  const formatIDR = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, ""); // Remove non-numeric characters
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Add thousands separator
  };

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPrice = formatIDR(e.target.value);
    setPrice(formattedPrice ? `Rp ${formattedPrice}` : "");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg my-12 mt-24">
        <h1 className="text-2xl font-bold text-center mb-6">Add New Product</h1>
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
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="flex gap-2">
              <select
                id="category"
                value={category}
                onChange={handleCategoryChange}
                className="w-2/3 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={handleCategoryInput}
                className="w-1/3 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price per Day (in IDR)
            </label>
            <input
              id="price"
              type="text"
              value={price}
              onChange={handlePriceInput}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
            {recommendedPrice && (
              <p className="text-sm text-gray-500 mt-2">
                Recommended Price: Rp {recommendedPrice.toLocaleString("id-ID")}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </main>
  );
}
