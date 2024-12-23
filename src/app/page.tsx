"use client";

import { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "./components/ui/bento-grid";
import Link from "next/link";
import Image from "next/image";

type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  url: string;
};

const images = ["/images/hero1.webp", "/images/hero2.webp", "/images/hero3.webp"];
const fallbackImage = "/images/default-placeholder.png";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch items from the API
  useEffect(() => {
    async function fetchItems() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/items");
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        setItems(data);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error("Error fetching items:", error);
        setError("Unable to load items. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Hero image carousel logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <main>
        {/* Hero Section */}
        <section className="relative h-screen bg-blue-500 text-white flex items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            ))}
          </div>
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
              Unlock Access to Anything, Anywhere
            </h1>
            <p className="text-lg mb-8 drop-shadow-md">
              RentBuddy connects people with items to share with those who need them.
              Empowering communities, one rental at a time.
            </p>
            <Link
              href="/browse"
              className="bg-white text-blue-500 px-8 py-4 rounded-full shadow-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Exploring
            </Link>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </section>

        {/* Browse Items Section */}
        <section id="browse" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8 mx-4">
              <h2 className="text-3xl font-bold">Browse Items</h2>
              <Link
                href="/browse"
                className="text-blue-500 hover:underline font-semibold"
              >
                View All
              </Link>
            </div>

            {isLoading ? (
              <p className="text-center text-gray-500">Loading items...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <BentoGrid>
                {items.map((item, i) => {
                  // Create slug dynamically
                  const slug = item.title
                    .replace(/\s+/g, "-")
                    .toLowerCase()
                    .replace(/[^\w-]/g, "");

                  return (
                    <Link key={i} href={`/${slug}`} className="contents">
                      <BentoGridItem
                        category={item.category}
                        title={item.title}
                        description={item.description}
                        header={
                          <div className="aspect-video w-full overflow-hidden rounded-xl">
                            <Image
                              src={item.url || fallbackImage}
                              alt={item.title || "Item image"}
                              style={{ objectFit: "cover", objectPosition: "center" }}
                              width={800}
                              height={400}
                            />
                          </div>
                        }
                        className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                      />
                    </Link>
                  );
                })}
              </BentoGrid>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 RentBuddy. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
