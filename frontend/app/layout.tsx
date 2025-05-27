"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createContext, useEffect, useState } from "react";
import "./globals.css";
import { Account, Models } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite";
import { UserContext } from "./UserContext";
import { User } from "@/lib/User";
import { backendFetch } from "@/lib/backend";

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
        const res = await backendFetch("/users/me", "GET", "application/json");
        const j = await res.json();
        const me: User = j as User;

        console.log(me);
        setUser(
          new User({
            name: u.name,
            campus: me.campus,
            profile_picture: me.profile_picture,
            appwrite: u,
          }),
        );
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false); // mark loading complete
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="max-w-xs mx-auto">{children}</div>
        </body>
      </html>
    </UserContext.Provider>
  );
}
