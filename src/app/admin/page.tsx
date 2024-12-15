"use client";

import React, { useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  trust_score: number | null;
};

type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  url: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  ownerId?: number | null;
};

type Rental = {
  id: number;
  userId: number;
  itemId: number;
  startDate: string;
  endDate: string;
  totalCost: number;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  item: {
    title: string;
    price: number;
  };
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  renter: {
    username: string;
    email: string;
  };
  item: {
    title: string;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [usersResponse, itemsResponse, rentalsResponse, reviewsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/users`),
          fetch(`${API_BASE_URL}/api/admin/items`),
          fetch(`${API_BASE_URL}/api/admin/rentals`),
          fetch(`${API_BASE_URL}/api/admin/reviews`),
        ]);

        if (!usersResponse.ok) throw new Error("Failed to fetch users data");
        if (!itemsResponse.ok) throw new Error("Failed to fetch items data");
        if (!rentalsResponse.ok) throw new Error("Failed to fetch rentals data");
        if (!reviewsResponse.ok) throw new Error("Failed to fetch reviews data");

        const usersData: User[] = await usersResponse.json();
        const itemsData: Item[] = await itemsResponse.json();
        const rentalsData: Rental[] = await rentalsResponse.json();
        const reviewsData: Review[] = await reviewsResponse.json();

        setUsers(usersData);
        setItems(itemsData);
        setRentals(rentalsData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center text-lg">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-lg text-red-500">{error}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Users Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Users</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          {users.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No users found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2">ID</th>
                  <th className="border-b px-4 py-2">Username</th>
                  <th className="border-b px-4 py-2">Email</th>
                  <th className="border-b px-4 py-2">Role</th>
                  <th className="border-b px-4 py-2">Trust Score</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border-b px-4 py-2">{user.id}</td>
                    <td className="border-b px-4 py-2">{user.username}</td>
                    <td className="border-b px-4 py-2">{user.email}</td>
                    <td className="border-b px-4 py-2">{user.role}</td>
                    <td className="border-b px-4 py-2">
                      {user.trust_score ?? "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Items Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Items</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          {items.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No items found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2">ID</th>
                  <th className="border-b px-4 py-2">Title</th>
                  <th className="border-b px-4 py-2">Category</th>
                  <th className="border-b px-4 py-2">Price</th>
                  <th className="border-b px-4 py-2">Available</th>
                  <th className="border-b px-4 py-2">Owner ID</th>
                  <th className="border-b px-4 py-2">Slug</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border-b px-4 py-2">{item.id}</td>
                    <td className="border-b px-4 py-2">{item.title}</td>
                    <td className="border-b px-4 py-2">{item.category}</td>
                    <td className="border-b px-4 py-2">
                      Rp {item.price.toLocaleString("id-ID")}
                    </td>
                    <td className="border-b px-4 py-2">
                      {item.isAvailable ? "Yes" : "No"}
                    </td>
                    <td className="border-b px-4 py-2">{item.ownerId ?? "N/A"}</td>
                    <td className="border-b px-4 py-2">{item.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Rentals Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Rentals</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          {rentals.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No rentals found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2">Rental ID</th>
                  <th className="border-b px-4 py-2">User</th>
                  <th className="border-b px-4 py-2">Item</th>
                  <th className="border-b px-4 py-2">Start Date</th>
                  <th className="border-b px-4 py-2">End Date</th>
                  <th className="border-b px-4 py-2">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental, idx) => (
                  <tr
                    key={rental.id}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border-b px-4 py-2">{rental.id}</td>
                    <td className="border-b px-4 py-2">
                      {rental.user.username} ({rental.user.email})
                    </td>
                    <td className="border-b px-4 py-2">{rental.item.title}</td>
                    <td className="border-b px-4 py-2">{rental.startDate}</td>
                    <td className="border-b px-4 py-2">{rental.endDate}</td>
                    <td className="border-b px-4 py-2">
                      Rp {rental.totalCost.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          {reviews.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No reviews found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2">Review ID</th>
                  <th className="border-b px-4 py-2">Item</th>
                  <th className="border-b px-4 py-2">Renter</th>
                  <th className="border-b px-4 py-2">Rating</th>
                  <th className="border-b px-4 py-2">Comment</th>
                  <th className="border-b px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, idx) => (
                  <tr
                    key={review.id}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border-b px-4 py-2">{review.id}</td>
                    <td className="border-b px-4 py-2">{review.item.title}</td>
                    <td className="border-b px-4 py-2">
                      {review.renter.username} ({review.renter.email})
                    </td>
                    <td className="border-b px-4 py-2">{review.rating}</td>
                    <td className="border-b px-4 py-2">{review.comment}</td>
                    <td className="border-b px-4 py-2">
                      {new Date(review.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
