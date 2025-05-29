"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LucideCirclePlus,
  LucideMessageSquare,
  LucideSearch,
} from "lucide-react";
import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { ListingDto } from "@/lib/Listing";
import { getPictureUrl } from "@/lib/appwrite";
import { calculateDistance, TimeAgo } from "@/lib/utils";
import { ID } from "appwrite";

interface ListingCardProps {
  listing: ListingDto;
  userLongitude: number;
  userLatitude: number;
}
function ListingCard(props: ListingCardProps) {
  const { listing, userLongitude, userLatitude } = props;

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
          <div className="flex gap-2">
            <p className="text-xs text-gray-500">
              {userLatitude &&
                userLongitude &&
                Math.trunc(
                  calculateDistance(
                    listing.latitude,
                    listing.longitude,
                    userLatitude,
                    userLongitude,
                  ),
                )}
              m
            </p>
            <p className="text-xs text-gray-500">
              <TimeAgo timestamp={new Date(listing.created_at)} /> ago
            </p>
          </div>
          <div>
            <p className="font-bold text-lg">
              {listing?.payment?.toLocaleString()} won
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

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLong, setUserLong] = useState<number | null>(null);

  const [listings, setListings] = useState<ListingDto[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }

    (async () => {
      const res = await backendFetch("/listings", "GET", "application/json");
      const j = await res.json();
      let ls: ListingDto[] = j as ListingDto[];
      setListings(ls);

      let pos = navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLong(pos.coords.longitude);
        },
        (e) => {
          console.log(e);
        },
      );
    })();
  }, [user, loading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="flex h-14 items-center mt-4 w-full">
        {user?.name && (
          <p className="text-xl font-bold grow">
            Hi, {user?.name?.split(" ")[0]}!
          </p>
        )}

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
          <Link href={"/listings/" + item.id} key={ID.unique()}>
            <ListingCard
              listing={item}
              userLongitude={userLong}
              userLatitude={userLat}
            ></ListingCard>
          </Link>
        ))}
      </div>
    </>
  );
}
