"use client";

import { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "./components/ui/bento-grid";
import { items } from "../data/items";
import Link from "next/link";
import Image from "next/image";

const images = ["/images/hero1.png", "/images/hero2.png", "/images/hero3.jpg"];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
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
            <a
              href="#browse"
              className="bg-white text-blue-500 px-8 py-4 rounded-full shadow-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Exploring
            </a>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        </section>

        {/* Browse Items Section */}
        <section id="browse" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Browse Items</h2>
            <BentoGrid>
  {items.map((item, i) => {
    const slug = item.title.replace(/\s+/g, '-').toLowerCase();
    console.log("Generated slug:", slug); // Tambahkan log ini
    return (
      <Link 
        key={i} 
        href={`/${slug}`}
        className="contents"
      >
        <BentoGridItem
          title={item.title}
          description={item.description}
          header={
            <div className="aspect-video w-full overflow-hidden rounded-xl">
              <Image 
                src={item.url}
                alt={item.title}
                style={{ objectFit: "cover" }}
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

          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 RentBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
