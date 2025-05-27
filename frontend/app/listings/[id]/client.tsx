"use client";

import { UserContext } from "@/app/UserContext";
import { backendFetch } from "@/lib/backend";
import { ListingDto } from "@/lib/Listing";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getPictureUrl } from "@/lib/appwrite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/User";
import { Button } from "@/components/ui/button";
import { LucideChevronLeft, LucideHeart } from "lucide-react";

interface PicturesCarouselProps {
  pictures: string[];
}
function PicturesCarousel(props: PicturesCarouselProps) {
  const { pictures } = props;
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {pictures.map((pic, index) => (
          <CarouselItem key={index} className="aspect-square">
            <img
              src={pic}
              className="w-full h-full object-cover"
              alt={`Picture ${index}`}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="translate-x-16 translate-y-28" />
      <CarouselNext className="-translate-x-16 translate-y-28" />
    </Carousel>
  );
}

interface ListingPageComponentProps {
  id: string;
}
export default function ListingPageComponent(props: ListingPageComponentProps) {
  const { id } = props;
  const { user, loading } = useContext(UserContext);
  const [listing, setListing] = useState<ListingDto | null>();
  const [pictures, setPictures] = useState<string[]>([]);
  const [lister, setLister] = useState<User | null>(null);
  const router = useRouter();

  async function applyToListing() {
    const res = await backendFetch(
      "/listings/" + id + "/apply",
      "POST",
      "application/json",
    );
    if (res.ok) {
      window.location.href = "/listings/" + id;
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    (async () => {
      const listingRes = await backendFetch(
        "/listings/" + id,
        "GET",
        "application/json",
      );
      const listingJson = await listingRes.json();
      const listing: ListingDto = listingJson as ListingDto;
      setListing(listing);

      let pics = listing.pictures.map((pic) => {
        return getPictureUrl(pic);
      });
      setPictures(pics);

      const listerRes = await backendFetch(
        "/users/" + listing.lister,
        "GET",
        "application/json",
      );
      const listerJson = await listerRes.json();
      const lister: User = listerJson as User;
      setLister(lister);

      console.log(listing);
    })();
  }, [user, loading]);

  if (loading || !listing) {
    return <p>Loading...</p>;
  }

  return (
    <div className="relative mx-auto">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10"
      >
        <LucideChevronLeft className="w-10 h-10" />
      </button>

      <div className="mx-auto">
        <PicturesCarousel pictures={pictures!} />

        <div className="flex mt-4 w-full">
          <Avatar className="w-10 h-auto">
            <AvatarImage src={lister?.profile_picture} />
            <AvatarFallback>
              <img src="/default_avatar.png" />
            </AvatarFallback>
          </Avatar>

          <div className="ml-2 w-full">
            <p className="text-sm font-semibold">{lister?.name}</p>
            <p className="text-xs">male</p>
          </div>
        </div>

        <p className="text-lg font-semibold">{listing.title}</p>
        <div className="mt-4">
          <div className="flex gap-2">
            <p className="text-xs">{listing.longitude}</p>
            <p className="text-xs">{listing.latitude}</p>
          </div>
        </div>

        <p>{listing.description}</p>
        <div className="h-32"></div>

        <div className="flex fixed bottom-0 left-0 w-full bg-white p-4 justify-start gap-4 items-center border-t">
          <div className="text-gray-500">
            <LucideHeart className="w-10 h-auto" />
          </div>
          <div className="grow">
            <p className="font-bold text-lg">
              {listing.payment.toLocaleString()} won
            </p>
            <p className="text-gray-500 text-xs">Non-negotiable</p>
          </div>
          {listing.lister != user.appwrite["$id"] &&
            (listing.applicants?.includes(user.appwrite["$id"]) ? (
              <Button disabled={true} className="bg-blue-900 text-xs h-12">
                Already applied
              </Button>
            ) : (
              <Button
                onClick={applyToListing}
                className="bg-blue-900 text-xs h-12"
              >
                Apply
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
