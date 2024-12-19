"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Rental = {
  id: number;
  item: {
    title: string;
    description: string;
    url: string;
    price: number;
  };
  startDate: string;
  endDate: string;
  totalCost: number;
  hasReviewed: boolean;
};

export default function HistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(`/api/rentals?userId=${session?.user?.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch rental history");
        }
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setRentals(result.data);
          setFilteredRentals(result.data);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchHistory();
    }
  }, [session?.user?.id]);

  const handleSort = (field: string) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  
    const sorted = [...filteredRentals].sort((a, b) => {
      if (field === "price") {
        return order === "asc"
          ? a.item.price - b.item.price
          : b.item.price - a.item.price;
      } else if (field === "totalCost") {
        return order === "asc"
          ? a.totalCost - b.totalCost
          : b.totalCost - a.totalCost;
      } else if (field === "startDate") {
        return order === "asc"
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else {
        return order === "asc"
          ? a.item.title.localeCompare(b.item.title)
          : b.item.title.localeCompare(a.item.title);
      }
    });
  
    setFilteredRentals(sorted);
  };
  

  const handleFilter = () => {
    const filtered = rentals.filter((rental) => {
      const categoryMatch = filters.category
        ? rental.item.title.toLowerCase().includes(filters.category.toLowerCase())
        : true;
      const statusMatch = filters.status
        ? filters.status === "reviewed"
          ? rental.hasReviewed
          : !rental.hasReviewed
        : true;
      return categoryMatch && statusMatch;
    });
    setFilteredRentals(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
          <p className="text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-24 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Rental History</h1>
            <p className="mt-2 text-gray-700">
              A list of all your rental orders including their status and details.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by Item"
              className="px-3 py-2 border border-gray-300 rounded-full bg-white text-gray-700"
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-full bg-white text-gray-700"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="reviewed">Reviewed</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>

          {/* Table */}
          {filteredRentals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-black">
                  <tr>
                    {[
                      { label: "Order", field: "id" },
                      { label: "Item", field: "title" },
                      { label: "Price", field: "totalCost" },
                      { label: "Date", field: "startDate" },
                      { label: "Status", field: "hasReviewed" },
                    ].map((header) => (
                      <th
                        key={header.field}
                        onClick={() => handleSort(header.field)}
                        className="py-3.5 px-3 text-left font-semibold text-white cursor-pointer"
                      >
                        {header.label}{" "}
                        <i
                          className={`fas fa-arrow-up ml-2 ${
                            sortField === header.field && sortOrder === "asc"
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        />
                        <i
                          className={`fas fa-arrow-down ml-1 ${
                            sortField === header.field && sortOrder === "desc"
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        />
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left font-semibold text-white"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredRentals.map((rental) => (
                    <tr key={rental.id}>
                      <td className="py-4 pl-4 pr-3 font-medium text-gray-900">
                        #{rental.id.toString().padStart(5, "0")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <Image
                              className="h-10 w-10 rounded-full object-cover"
                              src={rental.item.url}
                              alt=""
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {rental.item.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-gray-500">
                        Rp {rental.totalCost.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-4 text-gray-500">
                        {new Date(rental.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            rental.hasReviewed
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          <i
                            className={`fas ${
                              rental.hasReviewed ? "fa-check" : "fa-times"
                            } mr-1`}
                          ></i>
                          {rental.hasReviewed ? "Reviewed" : "Pending Review"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          onClick={() =>
                            router.push(
                              `/leave-review/${rental.id}?edit=${rental.hasReviewed}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {rental.hasReviewed ? "Edit Review" : "Leave Review"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
