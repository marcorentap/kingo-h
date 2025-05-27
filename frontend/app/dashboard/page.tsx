"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import {
  LucideCirclePlus,
  LucideMessageSquare,
  LucideSearch,
} from "lucide-react";
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

        <div className="bg-gray-300 rounded-full flex items-center py-0.5 px-1 ml-10">
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
            <AvatarFallback>
              <img src="/default_avatar.png" />
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      <div className="grid gap-4 mt-4">
        {listings.map((item) => (
          <Link href={"/listings/" + item.id}>
            <ListingCard key={item.id} listing={item}></ListingCard>
          </Link>
        ))}
      </div>
    </>
  );
}
