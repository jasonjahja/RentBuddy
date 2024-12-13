import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
  }[];
  className?: string;
}) => {
  const { data: session, status } = useSession()
  if (status === "authenticated" && session?.user?.role === "owner") {
    if (!navItems.some((item) => item.link === "/owner/items")) {
      navItems.push({ name: "My Items", link: "/owner/items" });
    }
  } if (status === "authenticated" && session?.user?.role === "renter") {
    if (!navItems.some((item) => item.link === "/history")) {
      navItems.push({ name: "History", link: "/history" });
    }
  }

  const sessionLink =
    status === "loading" ? (
      <span className="text-sm font-medium text-gray-500">Loading...</span>
    ) : session?.user ? (
      <Link
        href="/profile"
        className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        aria-label="Profile"
      >
        <span>Profile</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-green-500 to-transparent h-px" />
      </Link>
    ) : (
      <Link
        href="/auth/login"
        className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        aria-label="Login"
      >
        <span>Login</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
      </Link>
    );

  return (
    <div
      className={`fixed top-0 inset-x-0 mx-auto z-[5000] bg-white dark:bg-black border-b border-neutral-200 dark:border-white/[0.2] shadow-md px-8 py-4 flex justify-between items-center ${className}`}
    >
      {/* Left Section (Logo) */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2" aria-label="Home">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain"
            onError={(e) => (e.currentTarget.src = "/images/default-logo.png")}
          />
          <span className="text-xl font-semibold text-black dark:text-white">
            RentBuddy
          </span>
        </Link>
      </div>

      {/* Right Section (Navigation Items) */}
      <div className="flex items-center space-x-8">
        <div className="hidden sm:flex items-center space-x-6">
          {navItems.map((navItem, idx: number) => (
            <Link
              key={`link-${idx}`}
              href={navItem.link || "/"}
              className="relative text-sm font-medium text-neutral-600 dark:text-neutral-50 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
              aria-label={navItem.name}
            >
              {navItem.name}
            </Link>
          ))}
        </div>

        {/* Conditional Login/Profile Button */}
        {sessionLink}
      </div>
    </div>
  );
};
