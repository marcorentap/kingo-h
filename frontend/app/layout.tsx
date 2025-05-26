"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createContext, useEffect, useState } from "react";
import "./globals.css";
import { Account, Models } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite";
import { UserContext } from "./UserContext";
import { User } from "@/lib/User";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // NEW

  useEffect(() => {
    (async () => {
      const client = getAppwriteClient();
      const account = new Account(client);
      try {
        const u = await account.get();
        setUser(new User(u.name, u));
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false); // mark loading complete
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </UserContext.Provider>
  );
}
