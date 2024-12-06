import Head from "next/head";
import {
    IconArrowWaveRightUp,
    IconBoxAlignRightFilled,
    IconBoxAlignTopLeft,
    IconClipboardCopy,
    IconFileBroken,
    IconSignature,
    IconTableColumn,
  } from "@tabler/icons-react";

const items = [
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

export async function getStaticPaths() {
  const paths = items.map((item) => ({
    params: { slug: item.title.replace(/\s+/g, "-").toLowerCase() },
  }));

  return { paths, fallback: "blocking" };
}


export async function getStaticProps({ params }: { params: { slug: string } }) {
  const item = items.find(
    (i) => i.title.replace(/\s+/g, "-").toLowerCase() === params.slug
  );

  return {
    props: { item },
  };
}

export default function ItemDetail({ item }: { item: typeof items[0] }) {
  if (!item) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>{item.title}</title>
        <meta name="description" content={item.description} />
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-500 text-white py-12 text-center">
          <h1 className="text-4xl font-bold">{item.title}</h1>
          <p className="text-lg mt-4">{item.description}</p>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="aspect-video w-full mb-8 overflow-hidden rounded-xl">
            <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec magna nulla. 
            Vivamus pharetra lorem a fermentum elementum. Integer suscipit ex id orci 
            tincidunt gravida.
          </p>
        </main>
        <footer className="bg-gray-800 text-white py-8 text-center">
          <p>&copy; 2024 RentBuddy. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
