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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [usersResponse, itemsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/users`),
          fetch(`${API_BASE_URL}/api/admin/items`),
        ]);

        if (!usersResponse.ok) {
          console.error("Users API Error:", await usersResponse.text());
          throw new Error("Failed to fetch users data");
        }
        if (!itemsResponse.ok) {
          console.error("Items API Error:", await itemsResponse.text());
          throw new Error("Failed to fetch items data");
        }

        const usersData: User[] = await usersResponse.json();
        const itemsData: Item[] = await itemsResponse.json();

        setUsers(usersData);
        setItems(itemsData);
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
      <section>
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
