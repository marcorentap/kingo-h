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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { ListingDto } from "@/lib/Listing";
import { getPictureUrl } from "@/lib/appwrite";
import { ListingCard } from "@/components/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
