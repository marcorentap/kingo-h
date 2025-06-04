"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LucideCirclePlus,
  LucideHome,
  LucideMessageSquare,
  LucideSearch,
  LucideStar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { ListingDto } from "@/lib/Listing";
import { getPictureUrl } from "@/lib/appwrite";
import { ListingCard } from "@/components/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Review } from "@/lib/Review";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { UserContext } from "@/app/UserContext";
import { User } from "@/lib/User";

interface ReviewCarouselProps {
  reviews: Review[];
}

function ReviewCarousel(props: ReviewCarouselProps) {
  const { reviews } = props;
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {reviews.map((rev, index) => (
          <CarouselItem key={index}>
            <div className="flex flex-col justify-between h-full text-center px-4">
              <blockquote className="italic mb-4">"{rev.review}"</blockquote>
              <div className="flex justify-center mt-auto mb-4">
                {Array.from({ length: 5 }, (_, i) => i < rev.rating).map(
                  (filled, i) => (
                    <LucideStar
                      key={i}
                      className="w-3 h-3 mx-0.5"
                      fill={filled ? "currentColor" : "none"}
                      stroke="currentColor"
                    />
                  ),
                )}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="translate-x-16" />
      <CarouselNext className="-translate-x-16" />
    </Carousel>
  );
}

interface OtherProfilePageProps {
  id: string;
}
export default function OtherProfilePageClient(props: OtherProfilePageProps) {
  const { user: curUser, loading } = useContext(UserContext);
  const [user, setUser] = useState<User>(null);

  const router = useRouter();
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLong, setUserLong] = useState<number | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);

  const [profileUser, setProfileUser] = useState<User>(null);

  useEffect(() => {
    if (!loading && !curUser) {
      window.location.href = "/login";
    }

    if (!loading && curUser.appwrite.$id == props.id) {
      window.location.href = "/profile";
    }

    (async () => {
      const userRes = await backendFetch(
        "/users/" + props.id,
        "GET",
        "application/json",
      );

      const user = (await userRes.json()) as User;
      setUser(user);

      const ratingRes = await backendFetch(
        "/users/" + props.id + "/ratings",
        "GET",
        "application/json",
      );
      const reviews = (await ratingRes.json()) as Review[];
      setReviews(reviews);
      console.log(reviews);

      const ratingsNum = reviews.map((r) => {
        return r.rating;
      });
      const averageRating =
        ratingsNum.length > 0
          ? ratingsNum.reduce((sum, val) => sum + val, 0) / ratingsNum.length
          : 0;
      setRating(averageRating);
    })();
  }, [curUser, loading]);

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

        <div className="flex justify-center items-center mt-1 mb-4">
          {Array.from({ length: 5 }, (_, i) => i < rating).map(
            (filled, index) => (
              <LucideStar
                key={index}
                className="w-4 h-4 mx-0.5"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
              />
            ),
          )}
        </div>

        {reviews.length > 0 && (
          <div className="my-4">
            <p className="text-center text-xl">Reviews</p>
            <ReviewCarousel reviews={reviews} />
          </div>
        )}
      </div>
    </div>
  );
}
