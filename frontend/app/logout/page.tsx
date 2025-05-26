"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient } from "@/lib/appwrite";
import { Account, AppwriteException, Client } from "appwrite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type LoginInputs = {
  email: string;
  password: string;
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const client = getAppwriteClient();
      const account = new Account(client);
      try {
        // User has existing session. Delete the session
        await account.get();
        router.push("/");
        account.deleteSession("current");
        router.push("/login");
      } catch (e) {
        // User has no existing session. Go to login
        router.push("/login");
      }
    })();
  }, []);

  return <></>;
}
