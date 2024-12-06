"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading state while checking session
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  // Display user information
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Profile</h1>
        <p className="text-center text-gray-600 mb-4">
          Welcome, <span className="font-bold">{session.user?.email}</span>!
        </p>
        <ul className="text-sm text-gray-600">
          <li>
            <span className="font-medium">Name:</span> {session.user?.name || "N/A"}
          </li>
          <li>
            <span className="font-medium">Email:</span> {session.user?.email}
          </li>
        </ul>
        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
