"use client";

import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
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
import { ListingCard } from "@/components/ListingCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SearchButtonProps = {
  onListingsUpdate: (listings: ListingDto[]) => void;
  userLat: number;
  userLong: number;
};
interface SearchInputs {
  search: string | null;
  maxDistance: number | null;
  status: "LISTED" | "INPROGRESS" | "AWAITREVIEW" | "COMPLETED" | null;
  category:
    | "Labor"
    | "Transport"
    | "Care"
    | "Technical"
    | "Support"
    | "Other"
    | null;
}
function SearchButton(props: SearchButtonProps) {
  const { register, handleSubmit, control, reset } = useForm<SearchInputs>();
  const { onListingsUpdate, userLat, userLong } = props;

  const onSubmit: SubmitHandler<SearchInputs> = async (data) => {
    const { search, maxDistance, status, category } = data;
    const res = await backendFetch(
      "/listings?" +
        (search ? "search=" + search + "&" : "") +
        (maxDistance ? "maxDistance=" + maxDistance + "&" : "") +
        (status ? "status=" + status + "&" : "") +
        (category ? "category=" + category + "&" : ""),
      "GET",
      "application/json",
    );
    const j = await res.json();
    let ls: ListingDto[] = j as ListingDto[];

    if (maxDistance) {
      ls = ls.filter((listing) => {
        const dist = calculateDistance(
          listing.latitude,
          listing.longitude,
          userLat,
          userLong,
        );
        return dist <= maxDistance;
      });
    }

    onListingsUpdate(ls);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <LucideSearch className="w-5 cursor-pointer mx-2" />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form encType="multipart/form-data" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            <div>
              Search
              <Input placeholder="Enter search term" {...register("search")} />
            </div>
            <div>
              Category
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  /* <Select {...register("category", { required: true })}> */
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Labor">Labor</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Care">Care</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              Maximum Distance
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Distance in meters"
                  {...register("maxDistance")}
                />
                <span>meters</span>
              </div>
            </div>
            <div>
              Status
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="LISTED">Open</SelectItem>
                        {/* Actually In Progress or Awaiting Review. But only listers can see the difference */}
                        <SelectItem value="INPROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-900 grow">
                Search
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  reset();
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
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
          <SearchButton
            onListingsUpdate={(listings) => setListings(listings)}
            userLat={userLat}
            userLong={userLong}
          />
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
