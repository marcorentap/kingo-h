"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
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
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default function ProfilePage() {
  const { user, loading } = useContext(UserContext);
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [listed, setListed] = useState<ListingDto[]>([]);
  const [applied, setApplied] = useState<ListingDto[]>([]);
  const router = useRouter();
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLong, setUserLong] = useState<number | null>(null);

  const [completed, setCompleted] = useState<ListingDto[]>([]);
  const [toReview, setToReview] = useState<ListingDto[]>([]);
  const [toComplete, setToComplete] = useState<ListingDto[]>([]);
  const [toWaitReview, setToWaitReview] = useState<ListingDto[]>([]);

  const [listedCompleted, setListedCompleted] = useState<ListingDto[]>([]);
  const [listedToReview, setListedToReview] = useState<ListingDto[]>([]);
  const [listedToComplete, setListedToComplete] = useState<ListingDto[]>([]);
  const [listedNotStarted, setListedNotStarted] = useState<ListingDto[]>([]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }

    (async () => {
      const res = await backendFetch("/listings/me", "GET", "application/json");
      const j = await res.json();
      let ls: ListingDto[] = j as ListingDto[];
      let listed: ListingDto[] = [];
      let applied: ListingDto[] = [];

      let completed: ListingDto[] = [];
      let toReview: ListingDto[] = [];
      let toComplete: ListingDto[] = [];
      let toWaitReview: ListingDto[] = [];

      let listedCompleted: ListingDto[] = [];
      let listedToReview: ListingDto[] = [];
      let listedToComplete: ListingDto[] = [];
      let listedNotStarted: ListingDto[] = [];

      setListings(ls);
      ls.forEach((listing) => {
        if (listing.lister == user.appwrite["$id"]) {
          listed.push(listing);
          setListed(listed);
        } else if (listing.applicants.includes(user.appwrite["$id"])) {
          applied.push(listing);
          setApplied(applied);
        }

        if (
          listing.freelancer == user.appwrite.$id &&
          listing.status == "COMPLETED" &&
          !listing.reviews
            .map((r) => {
              return r.reviewer;
            })
            .includes(user.appwrite.$id)
        ) {
          toReview.push(listing);
        }

        if (
          listing.freelancer == user.appwrite.$id &&
          listing.status == "INPROGRESS"
        ) {
          toComplete.push(listing);
        }

        if (
          listing.freelancer == user.appwrite.$id &&
          listing.status == "AWAITREVIEW"
        ) {
          toWaitReview.push(listing);
        }

        if (
          listing.freelancer == user.appwrite.$id &&
          listing.status == "COMPLETED"
        ) {
          completed.push(listing);
        }

        if (
          listing.lister == user.appwrite.$id &&
          listing.status == "INPROGRESS"
        ) {
          listedToComplete.push(listing);
        }

        if (
          listing.lister == user.appwrite.$id &&
          listing.status == "AWAITREVIEW"
        ) {
          listedToReview.push(listing);
        }

        if (
          listing.lister == user.appwrite.$id &&
          listing.status == "COMPLETED"
        ) {
          listedCompleted.push(listing);
        }

        if (listing.lister == user.appwrite.$id && listing.status == "LISTED") {
          listedNotStarted.push(listing);
        }
      });
      setToReview(toReview);
      setToComplete(toComplete);
      setCompleted(completed);
      setToWaitReview(toWaitReview);
      setListedToReview(listedToReview);
      setListedToComplete(listedToComplete);
      setListedCompleted(listedCompleted);
      setListedNotStarted(listedNotStarted);

      let pos = navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLong(pos.coords.longitude);
        },
        (e) => {
          console.log(e);
        },
      );

      const ratingRes = await backendFetch(
        "/users/me/ratings",
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

      <Tabs defaultValue="ongoing">
        <TabsList className="w-full">
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="listed">Listed</TabsTrigger>
        </TabsList>
        <TabsContent value="ongoing">
          <div className="grid gap-4 mt-4">
            {toWaitReview.length > 0 && (
              <p className="text-xl"> Awaiting Approval</p>
            )}
            {toWaitReview.map((item) => (
              <Link href={"/listings/" + item.id}>
                <ListingCard
                  listing={item}
                  userLongitude={userLong}
                  userLatitude={userLat}
                ></ListingCard>
              </Link>
            ))}
            {toReview.length > 0 && <p className="text-xl"> To Review</p>}
            {toReview.map((item) => (
              <Link href={"/listings/" + item.id}>
                <ListingCard
                  listing={item}
                  userLongitude={userLong}
                  userLatitude={userLat}
                ></ListingCard>
              </Link>
            ))}

            {toComplete.length > 0 && <p className="text-xl"> To Complete</p>}
            {toComplete.map((item) => (
              <Link href={"/listings/" + item.id}>
                <ListingCard
                  listing={item}
                  userLongitude={userLong}
                  userLatitude={userLat}
                ></ListingCard>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4 mt-4">
            {completed.length > 0 && <p className="text-xl"> Work History </p>}
            {completed.map((item) => (
              <Link href={"/listings/" + item.id}>
                <ListingCard
                  listing={item}
                  userLongitude={userLong}
                  userLatitude={userLat}
                ></ListingCard>
              </Link>
            ))}
            {listedCompleted.length > 0 && (
              <p className="text-xl"> Your Listings</p>
            )}
            {listedCompleted.map((item) => (
              <Link href={"/listings/" + item.id}>
                <ListingCard
                  listing={item}
                  userLongitude={userLong}
                  userLatitude={userLat}
                ></ListingCard>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="listed">
          <div className="grid gap-4 mt-4">
            {listedToReview.length > 0 && <p className="text-xl"> To Review</p>}
            {listedToReview.map((item) => (
              <Link href={"/listings/" + item.id}>
                <ListingCard
                  listing={item}
                  userLongitude={userLong}
                  userLatitude={userLat}
                ></ListingCard>
              </Link>
            ))}
            {listedToComplete.length > 0 && (
              <p className="text-xl"> To Complete</p>
            )}
            {listedToComplete.map((item) => (
              <Link href={"/listings/" + item.id}>
                <ListingCard
                  listing={item}
                  userLongitude={userLong}
                  userLatitude={userLat}
                ></ListingCard>
              </Link>
            ))}
            {listedNotStarted.length > 0 && (
              <p className="text-xl"> Not Started</p>
            )}
            {listedNotStarted.map((item) => (
              <Link href={"/listings/" + item.id}>
                <ListingCard
                  listing={item}
                  userLongitude={userLong}
                  userLatitude={userLat}
                ></ListingCard>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>

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
