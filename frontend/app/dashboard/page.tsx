"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { LucideCirclePlus, LucideSearch } from "lucide-react";
import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { ListingDto } from "@/lib/Listing";

export default function HomePage() {
  const { user, loading } = useContext(UserContext);
  const [listings, setListings] = useState<ListingDto[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    (async () => {
      const res = await backendFetch("/listings", "GET", "application/json");
      const j = await res.json();
      let ls: ListingDto[] = j as ListingDto[];
      setListings(ls);
      console.log(ls);
    })();
  }, [user, loading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="flex h-14 items-center mt-4 w-full">
        <p className="text-xl font-bold grow">
          Hi, {user?.name.split(" ")[0]}!
        </p>

        <div className="bg-gray-300 rounded-full flex items-center py-0.5 px-1 ml-10 cursor-pointer">
          <LucideCirclePlus className="w-5" />
          <Link href="/listings/create" className="text-xs font-semibold pl-1">
            Add Listing
          </Link>
        </div>

        <div>
          <LucideSearch className="w-5 mx-2" />
        </div>

        <Link href="/profile">
          <Avatar>
            <AvatarImage src={user?.profile_picture} />
            <AvatarFallback>{user?.name.split(" ")[0]}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
      <div>
        {listings.map((item) => (
          <div key={item.id}>{item.title}</div>
        ))}
      </div>
    </>
  );
}
