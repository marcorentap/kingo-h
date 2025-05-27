"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import {
  LucideCirclePlus,
  LucideHome,
  LucideMessageSquare,
  LucideSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { ListingDto } from "@/lib/Listing";
import { getPictureUrl } from "@/lib/appwrite";

interface ListingCardProps {
  listing: ListingDto;
}
function ListingCard(props: ListingCardProps) {
  const { listing } = props;

  return (
    <div className="flex w-full">
      <div className="w-32 h-32 overflow-hidden rounded-lg">
        <img
          className="w-full h-full object-cover"
          src={getPictureUrl(listing.pictures[0])}
        />
      </div>

      <div className="ml-4 flex flex-col justify-between grow">
        <div>
          <p className="text-lg font-medium">{listing.title}</p>
          <div className="flex">
            <p className="text-xs text-gray-500">200m</p>
            <p className="text-xs text-gray-500">2 minutes ago</p>
          </div>
          <div>
            <p className="font-bold text-lg">
              {listing.payment.toLocaleString()} won
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <p className="text-xs">N</p>
          <LucideMessageSquare className="w-5" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading } = useContext(UserContext);
  const [listings, setListings] = useState<ListingDto[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }

    (async () => {
      const res = await backendFetch("/listings/me", "GET", "application/json");
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
    <div className="relative">
      <div className="flex h-14 items-center mt-4 w-full">
        <Link href="/dashboard" className="text-gray-500">
          <LucideHome />
        </Link>
        <h2 className="text-xl ml-2 font-bold grow">Profile</h2>
      </div>
      <div className="w-full">
        <Avatar className="mx-auto w-20 h-auto">
          <AvatarImage src={user?.profile_picture} />
          <AvatarFallback>
            <img src="/default_avatar.png" />
          </AvatarFallback>
        </Avatar>
        <p className="text-xs text-center mx-auto text-gray-500 mt-2">
          Upload Image
        </p>
        <p className="text-2xl text-center mx-auto mt-2">{user?.name}</p>
      </div>

      <div className="grid gap-4 mt-4">
        {listings.map((item) => (
          <Link href={"/listings/" + item.id}>
            <ListingCard key={item.id} listing={item}></ListingCard>
          </Link>
        ))}
      </div>

      <div className="h-32"></div>
      <div className="flex fixed bottom-0 left-0 w-full bg-white p-4 justify-start gap-4 items-center border-t">
        <Link href="/logout" className="mx-auto">
          <Button className="bg-red-600 mx-auto text-xs w-xs h-12">
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
}
