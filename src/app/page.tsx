"use client";

import { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "./components/ui/bento-grid";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import Link from "next/link";

const images = ["hero1.png", "hero2.png", "hero3.jpg"];
export const items = [
  {
    title: "Mountain Bike",
    description: "A rugged bike perfect for off-road adventures and mountain trails.",
    price: 499.99,
    reviews: [
      { user: "Alice", comment: "Great bike for the price!", rating: 5 },
      { user: "Bob", comment: "Handles rough terrain like a champ.", rating: 4 },
    ],
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
    url: "hero2.png",
  },
  {
    title: "DSLR Camera",
    description: "A professional-grade camera for capturing stunning photos and videos.",
    price: 899.99,
    reviews: [
      { user: "Charlie", comment: "Amazing image quality!", rating: 5 },
      { user: "Dana", comment: "Perfect for both beginners and pros.", rating: 5 },
    ],
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
    url: "hero2.png",
  },
  {
    title: "Camping Tent",
    description: "A durable and spacious tent ideal for camping trips with family or friends.",
    price: 129.99,
    reviews: [
      { user: "Ella", comment: "Very easy to set up.", rating: 5 },
      { user: "Finn", comment: "Kept us dry during heavy rain.", rating: 4 },
    ],
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    url: "hero2.png",
  },
  {
    title: "Smartphone",
    description: "A sleek and powerful smartphone with all the latest features.",
    price: 799.99,
    reviews: [
      { user: "Grace", comment: "Battery life is outstanding.", rating: 5 },
      { user: "Henry", comment: "Fast performance and great camera.", rating: 5 },
    ],
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    url: "hero2.png",
  },
  {
    title: "Electric Scooter",
    description: "A lightweight scooter for quick and efficient urban transportation.",
    price: 299.99,
    reviews: [
      { user: "Isla", comment: "Super convenient for city commutes.", rating: 5 },
      { user: "Jack", comment: "Great range and speed.", rating: 4 },
    ],
    icon: <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500" />,
    url: "hero2.png",
  },
  {
    title: "Gaming Laptop",
    description: "A high-performance laptop designed for gaming and multitasking.",
    price: 1499.99,
    reviews: [
      { user: "Kim", comment: "Runs all the latest games flawlessly.", rating: 5 },
      { user: "Leo", comment: "Fantastic display and build quality.", rating: 5 },
    ],
    icon: <IconBoxAlignTopLeft className="h-4 w-4 text-neutral-500" />,
    url: "hero2.png",
  },
  {
    title: "Acoustic Guitar",
    description: "A finely crafted guitar perfect for beginners and professionals alike.",
    price: 199.99,
    reviews: [
      { user: "Mia", comment: "Great sound quality and easy to play.", rating: 5 },
      { user: "Noah", comment: "Affordable yet premium feel.", rating: 5 },
    ],
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
    url: "hero2.png",
  },
];


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
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          }
          icon={item.icon}
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
