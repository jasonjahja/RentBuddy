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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-black px-8 py-6 text-white">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-gray-300 mt-1">
            Welcome, <span className="font-semibold">{username || "User"}</span>
          </p>
        </div>
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <i className="fas fa-user text-black w-5 h-5"></i>
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="font-semibold text-gray-900">{username || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <i className="fas fa-envelope text-black w-5 h-5"></i>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{email || "N/A"}</p>
              </div>
            </div>
            {role && (
              <div className="flex items-center space-x-4">
                <i className="fas fa-tag text-black w-5 h-5"></i>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p
                    className={`font-semibold ${
                      role === "renter" ? "text-blue-600" : "text-green-600"
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </p>
                </div>
              </div>
            )}
            {role === "renter" && trust_score !== undefined && (
              <div className="flex items-center space-x-4">
                <i className="fas fa-star text-black w-5 h-5"></i>
                <div>
                  <p className="text-sm font-medium text-gray-500">Trust Score</p>
                  <p className="font-semibold text-blue-600">{trust_score}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-12">
            <button
              onClick={handleLogout}
              className="w-full bg-black text-white font-semibold py-2 px-4 rounded hover:bg-gray-800 transition duration-200 flex items-center justify-center"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <i className="fas fa-home mr-2"></i>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </main>
  );   
}