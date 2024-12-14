"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  url: string;
};

export default function Browse() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  // Fetch items from the API
  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch("/api/items");
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data: Item[] = await response.json();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }
    fetchItems();
  }, []);

  // Apply filters to the items
  // Apply filters to the items
const applyFilters = () => {
  const lowerSearch = search.toLowerCase();
  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(lowerSearch);

    // Normalize category comparison (case-insensitive)
    const matchesCategory =
      category === "" || item.category.toLowerCase() === category.toLowerCase();

    const priceWithinRange =
      (minPrice === "" || item.price >= parseFloat(minPrice)) &&
      (maxPrice === "" || item.price <= parseFloat(maxPrice));

    return matchesSearch && matchesCategory && priceWithinRange;
  });

  setFilteredItems(filtered);
};

  // Handle pressing Enter in the search field
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setFilteredItems(items);
  };

  return (
    <main className="bg-gray-50 min-h-screen pt-[64px] relative">
      {/* Fixed Filter Container */}
      <aside
        className="fixed top-[88px] left-[24px] w-[300px] h-auto border border-gray-300 rounded-lg p-6 bg-white flex flex-col justify-between"
        style={{ boxSizing: "border-box" }}
      >
        <div>
          <h2 className="text-xl font-bold mb-6">Filters</h2>

          {/* Category Filter */}
          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-2 text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Electronics">Electronics</option>
              <option value="Home">Home</option>
              <option value="Transport">Transport</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-12">
            <label
              htmlFor="price-range"
              className="block text-sm font-medium mb-2 text-gray-700"
            >
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                id="minPrice"
                type="number"
                placeholder="Min"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                id="maxPrice"
                type="number"
                placeholder="Max"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={applyFilters}
            className="w-full bg-gray-900 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="w-full bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-[350px] bg-white p-6 min-h-screen">
        {/* Search Bar with Search Button */}
        <div className="relative flex items-center mb-8">
          <i
            className="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          ></i>
          <input
            type="text"
            placeholder="Search items..."
            className="border border-gray-300 rounded-lg p-3 pl-12 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button
            onClick={applyFilters}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-300 text-white px-3 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
          >
            <i className="fa fa-search"></i>
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const slug = item.title.replace(/\s+/g, "-").toLowerCase();
            return (
              <Link key={item.id} href={`/${slug}`}>
                <div className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
                  <div className="aspect-video relative">
                    <Image
                      src={item.url}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-4">
                    {item.category && (
                      <div className="inline-block mb-2">
                        <span className="inline-block border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                          {item.category}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    {/* Availability Status */}
                    <p
                      className={`text-sm font-medium mt-2 ${
                        item.isAvailable
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.isAvailable ? "Available Now" : "Currently Rented"}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      {item.description}
                    </p>
                    <p className="text-blue-500 font-bold text-lg mt-4">
                      Rp{" "}
                      {item.price.toLocaleString("id-ID", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </main>
  );
}
