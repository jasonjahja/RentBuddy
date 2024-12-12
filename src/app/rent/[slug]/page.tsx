"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DateRangePicker, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  url: string;
};

export default function RentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string; // Explicitly cast to string
  const [selectedDates, setSelectedDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItem() {
      try {
        if (!slug) {
          throw new Error("Slug is not provided");
        }
        const response = await fetch(`/api/items?slug=${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch item");
        }
        const data = await response.json();
        setItem(data);
      } catch (err) {
        console.error((err as Error).message);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [slug]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !item) {
    return <p>{error || "Item not found"}</p>;
  }

  const handleDateChange = (ranges: RangeKeyDict) => {
    setSelectedDates({
      startDate: ranges.selection.startDate || new Date(),
      endDate: ranges.selection.endDate || new Date(),
    });
  };

  const durationInDays =
    (selectedDates.endDate.getTime() - selectedDates.startDate.getTime()) /
    (1000 * 60 * 60 * 24);

  const totalCost = Math.max(1, Math.ceil(durationInDays)) * item.price;

  const handlePayment = () => {
    alert(
      `Payment confirmed for ${item.title}. Total cost: Rp ${totalCost.toLocaleString(
        "id-ID"
      )}. Rental duration: ${Math.max(1, Math.ceil(durationInDays))} days.`
    );
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-20">
        <div className="w-full max-w-5xl mb-6">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back(); // Navigate to the previous page if it exists in history
              } else {
                router.push("/"); // Fallback to the home page
              }
            }}
            className="flex items-center gap-2 text-gray-800 px-4 py-2 rounded-md hover:text-gray-400 transition"
          >
            <i className="fas fa-angle-left"></i>
            Back
          </button>
        </div>
        {/* Calendar Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Select <span className="text-blue-500">{item.title}</span> Rental
            Duration
          </h2>
          <div className="border border-gray-300 rounded-lg p-4">
            <DateRangePicker
              ranges={[
                {
                  startDate: selectedDates.startDate,
                  endDate: selectedDates.endDate,
                  key: "selection",
                },
              ]}
              onChange={handleDateChange}
              moveRangeOnFirstSelection={false}
              rangeColors={["#007BFF"]}
              showDateDisplay={false}
              months={1}
              direction="vertical"
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Total Cost Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Total Cost
          </h2>
          <div className="p-6 bg-blue-50 rounded-lg shadow-inner">
            <p className="text-lg font-medium text-gray-600">
              Price per day:{" "}
              <span className="font-bold text-gray-800">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
            </p>
            <p className="text-lg font-medium text-gray-600">
              Duration:{" "}
              <span className="font-bold text-gray-800">
                {Math.max(1, Math.ceil(durationInDays))}{" "}
                {Math.max(1, Math.ceil(durationInDays)) > 1 ? "days" : "day"}
              </span>
            </p>
            <p className="text-lg font-bold text-blue-700 mt-2">
              Total: Rp {totalCost.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Rent Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full px-6 py-3 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
        >
          Rent Now
        </button>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Confirm Your Payment
            </h2>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Rental Summary
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-600">
                  <span className="font-semibold">Item:</span> {item.title}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Duration:</span>{" "}
                  {Math.max(1, Math.ceil(durationInDays))}{" "}
                  {Math.max(1, Math.ceil(durationInDays)) > 1 ? "days" : "day"}
                </p>
                <p className="text-blue-700 font-bold mt-2">
                  Total: Rp {totalCost.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="payment-method"
                className="block text-gray-600 font-medium mb-2"
              >
                Select Payment Method
              </label>
              <select
                id="payment-method"
                className="block w-full border border-gray-300 rounded-lg p-2 text-gray-700"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Choose a payment method</option>
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={!paymentMethod}
                className={`px-4 py-2 rounded-md text-white font-semibold transition ${
                  paymentMethod
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
