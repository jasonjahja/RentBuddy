"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-gray-100">
        <div className="flex items-center space-x-2 text-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" }); // Redirect to login after signing out
  };

  const { username, email, role, trust_score } = session.user || {};

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Profile
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Welcome,{" "}
          <span className="font-bold">{username || "User"}!</span>
        </p>
        <ul className="text-gray-700 text-sm leading-6 space-y-2 mb-8">
          <li>
            <span className="font-semibold text-gray-800">Username:</span>{" "}
            {username || "N/A"}
          </li>
          <li>
            <span className="font-semibold text-gray-800">Email:</span>{" "}
            {email || "N/A"}
          </li>
          {role && (
            <li>
              <span className="font-semibold text-gray-800">Role:</span>{" "}
              <span
                className={`font-bold ${
                  role === "renter" ? "text-blue-600" : "text-green-600"
                }`}
              >
                {role}
              </span>
            </li>
          )}
          {role === "renter" && trust_score !== undefined && (
            <li>
              <span className="font-semibold text-gray-800">Trust Score:</span>{" "}
              <span className="font-bold text-yellow-600">
                {trust_score}
              </span>
            </li>
          )}
        </ul>
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
          >
            Logout
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
