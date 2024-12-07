  export interface Review {
    user: string;
    comment: string;
    rating: number;
  }
  
  export interface Item {
    title: string;
    description: string;
    price: number;
    reviews: Review[]; 
    url: string;
  }
  
  export const items: Item[] = [
  {
    title: "Mountain Bike",
    description: "A rugged bike perfect for off-road adventures and mountain trails.",
    price: 499.99,
    reviews: [
      { user: "Alice", comment: "Great bike for the price!", rating: 5 },
      { user: "Bob", comment: "Handles rough terrain like a champ.", rating: 4 },
    ], 
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
      url: "hero2.png",
    },
  ];
  