"use client";

import { usePathname } from "next/navigation";
import localFont from "next/font/local";
import "./globals.css";
import { FloatingNav } from "./components/ui/FloatingNavbar";
import { SessionProvider } from "next-auth/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const navItems = [
  { name: "Home", link: "/" },
  { name: "Browse", link: "/#browse" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Define routes where the navbar should not appear
  const noNavRoutes = ["/auth/login", "/auth/register"];
  const shouldShowNavbar = !noNavRoutes.includes(pathname);

  return (
    <html lang="en">
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {/* Conditionally render the navbar */}
          {shouldShowNavbar && <FloatingNav navItems={navItems} className="navbar" />}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
