"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient } from "@/lib/appwrite";
import { Account, AppwriteException, Client } from "appwrite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { UserContext } from "../UserContext";

export default function LogoutPage() {
  const { user, loading, setUser } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!loading && user) {
        // User has existing session. Delete the session
        const account = new Account(getAppwriteClient());
        await account.deleteSession("current");
        setUser(null);
        window.location.href = "/login"; // Hard refresh
      }

      if (!loading && !user) {
        // No existing session. Go to login
        window.location.href = "/login"; // Hard refresh
      }
    })();
  }, [user, loading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return <></>;
}
