"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { UserContext } from "../UserContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { LucideCirclePlus, LucideHome, LucideSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
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
      <div className="flex h-14 items-center mt-4 w-full">
        <Link href="/dashboard">
          <LucideHome />
        </Link>
        <h2 className="text-xl ml-2 font-bold grow">Profile</h2>
      </div>
      <div className="w-full">
        <Avatar className="mx-auto w-20 h-auto">
          <AvatarImage src={user?.profile_picture} />
          <AvatarFallback>{user?.name.split(" ")[0]}</AvatarFallback>
        </Avatar>
        <p className="text-xs text-center mx-auto text-gray-500 mt-2">
          Upload Image
        </p>
        <p className="text-2xl text-center mx-auto mt-2">{user?.name}</p>
      </div>
      <Link
        href="/logout"
        className="fixed bottom-10 left-1/2 -translate-x-1/2"
      >
        <Button className="bg-red-600 text-xs w-xs h-12">Logout</Button>
      </Link>
    </>
  );
}
