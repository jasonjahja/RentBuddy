export interface Review {
  user: string;
  comment: string;
  rating: number;
}

export interface Item {
  title: string;
  description: string;
  price: number; // Price in Rupiah (float)
  reviews: Review[];
  url: string;
  category: string;
  isAvailable: boolean; // Availability status
  rentDuration?: number; // Rent duration in days, only if rented
}

export const items: Item[] = [
  {
    title: "Mountain Bike",
    description: "A rugged bike perfect for off-road adventures and mountain trails.",
    price: 7499999.0, // IDR equivalent
    reviews: [
      { user: "Alice", comment: "Great bike for the price!", rating: 5 },
      { user: "Bob", comment: "Handles rough terrain like a champ.", rating: 4 },
    ],
    url: "/images/bike.png",
    category: "Outdoors",
    isAvailable: false,
    rentDuration: 3, // Rented for 3 days
  },
  {
    title: "DSLR Camera",
    description: "A professional-grade camera for capturing stunning photos and videos.",
    price: 13499999.0, // IDR equivalent
    reviews: [
      { user: "Charlie", comment: "Amazing image quality!", rating: 5 },
      { user: "Dana", comment: "Perfect for both beginners and pros.", rating: 5 },
    ],
    url: "/images/camera.png",
    category: "Electronics",
    isAvailable: true,
  },
  {
    title: "Camping Tent",
    description: "A durable and spacious tent ideal for camping trips with family or friends.",
    price: 1949999.0, // IDR equivalent
    reviews: [
      { user: "Ella", comment: "Very easy to set up.", rating: 5 },
      { user: "Finn", comment: "Kept us dry during heavy rain.", rating: 4 },
    ],
    url: "/images/tent.png",
    category: "Outdoors",
    isAvailable: false,
    rentDuration: 5, // Rented for 5 days
  },
  {
    title: "Smartphone",
    description: "A sleek and powerful smartphone with all the latest features.",
    price: 11999999.0, // IDR equivalent
    reviews: [
      { user: "Grace", comment: "Battery life is outstanding.", rating: 5 },
      { user: "Henry", comment: "Fast performance and great camera.", rating: 5 },
    ],
    url: "/images/phone.png",
    category: "Electronics",
    isAvailable: true,
  },
  {
    title: "Electric Scooter",
    description: "A lightweight scooter for quick and efficient urban transportation.",
    price: 4499999.0, // IDR equivalent
    reviews: [
      { user: "Isla", comment: "Super convenient for city commutes.", rating: 5 },
      { user: "Jack", comment: "Great range and speed.", rating: 4 },
    ],
    url: "/images/scooter.png",
    category: "Transport",
    isAvailable: false,
    rentDuration: 2, // Rented for 2 days
  },
  {
    title: "Gaming Laptop",
    description: "A high-performance laptop designed for gaming and multitasking.",
    price: 22499999.0, // IDR equivalent
    reviews: [
      { user: "Kim", comment: "Runs all the latest games flawlessly.", rating: 5 },
      { user: "Leo", comment: "Fantastic display and build quality.", rating: 5 },
    ],
    url: "/images/laptop.png",
    category: "Electronics",
    isAvailable: true,
  },
  {
    title: "Acoustic Guitar",
    description: "A finely crafted guitar perfect for beginners and professionals alike.",
    price: 2999999.0, // IDR equivalent
    reviews: [
      { user: "Mia", comment: "Great sound quality and easy to play.", rating: 5 },
      { user: "Noah", comment: "Affordable yet premium feel.", rating: 5 },
    ],
    url: "/images/guitar.png",
    category: "Home",
    isAvailable: false,
    rentDuration: 7, // Rented for 7 days
  },
];
