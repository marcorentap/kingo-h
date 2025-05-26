"use client";

import { Input } from "@/components/ui/input";
import { getAppwriteClient } from "@/lib/appwrite";
import { Account, Models } from "appwrite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { backendFetch } from "@/lib/backend";

export default function HomePage() {
  const { user, loading } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Dashboard
      </h1>
      {user?.name}
    </>
  );
}
