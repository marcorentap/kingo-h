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
import { getCompletionPictureUrl, getPictureUrl } from "@/lib/appwrite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/User";
import { Button } from "@/components/ui/button";
import { LucideChevronLeft, LucideHeart, LucideStar } from "lucide-react";
import { calculateDistance } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

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

interface ApplicantCardProps {
  listing: ListingDto;
  applicant: User;
  applicantId: string;
  disabled: boolean;
}
function ApplicantCard(props: ApplicantCardProps) {
  const { applicant, applicantId, disabled, listing } = props;

  async function selectFreelancer(freelancerId: string) {
    const selectRes = await backendFetch(
      "/listings/" + listing.id + "/freelancer",
      "POST",
      "application/json",
      JSON.stringify({ freelancerId: freelancerId }),
    );
    if (selectRes.ok) {
      window.location.href = "/listings/" + listing.id;
    }
  }
  return (
    <div className="flex mt-4 w-full">
      <Avatar className="w-10 h-auto">
        <AvatarImage src={applicant.profile_picture} />
        <AvatarFallback>
          <img src="/default_avatar.png" />
        </AvatarFallback>
      </Avatar>

      <div className="ml-2 w-full">
        <p className="text-sm font-semibold">{applicant.name}</p>
        <p className="text-xs">male</p>
      </div>

      {!disabled && (
        <Button
          className="bg-blue-900"
          onClick={() => {
            selectFreelancer(applicantId);
          }}
        >
          Select
        </Button>
      )}
    </div>
  );
}

type ApproveInputs = {
  rating: number;
};

interface ApproveButtonProps {
  listing: ListingDto;
}

export function ApproveButton(props: ApproveButtonProps) {
  const { listing } = props;
  const { watch, register, handleSubmit } = useForm<ApproveInputs>();
  const onSubmit: SubmitHandler<ApproveInputs> = async (data) => {
    const res = await backendFetch(
      "/listings/" + listing.id + "/approve",
      "POST",
      "application/json",
      JSON.stringify(data),
    );
    if (res.ok) {
      window.location.href = "/listings/" + listing.id;
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-700">Approve Completion</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve Completion</DialogTitle>
          <DialogDescription>Rate this listing's completion</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} className="cursor-pointer">
                  <input
                    type="radio"
                    value={star}
                    {...register("rating", { required: true })}
                    className="hidden"
                  />
                  <LucideStar
                    className="w-8 h-8"
                    stroke="currentColor"
                    fill={watch("rating") >= star ? "currentColor" : "none"}
                  />
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="mt-4 text-xs bg-green-700 w-xs h-12">
            Approve Completion
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type CompletionInputs = {
  files: File[];
};

interface CompletionButtonProps {
  listing: ListingDto;
}
export function CompletionButton(props: CompletionButtonProps) {
  const { listing } = props;
  const { register, handleSubmit } = useForm<CompletionInputs>();
  const onSubmit: SubmitHandler<CompletionInputs> = async (data) => {
    const formData = new FormData();
    let fileList = data.files;
    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]); // match 'files' field name expected by FilesInterceptor
    }
    const res = await backendFetch(
      "/listings/" + listing.id + "/complete",
      "POST",
      null,
      formData,
    );
    if (res.ok) {
      window.location.href = "/listings/" + listing.id;
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-700">Mark complete</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Completion Proof</DialogTitle>
          <DialogDescription>
            Upload pictures to show that you have completed the work
          </DialogDescription>
        </DialogHeader>
        <form encType="multipart/form-data" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            <div>
              <Input
                type="file"
                multiple={true}
                accept="image/*"
                {...register("files")}
              />
            </div>
          </div>

          <Button type="submit" className="mt-4 text-xs bg-green-700 w-xs h-12">
            Mark Complete
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FreelancerCardProps {
  freelancer: User;
}
function FreelancerCard(props: FreelancerCardProps) {
  const { freelancer } = props;
  return (
    <div className="flex mt-4 w-full">
      <Avatar className="w-10 h-auto">
        <AvatarImage src={freelancer.profile_picture} />
        <AvatarFallback>
          <img src="/default_avatar.png" />
        </AvatarFallback>
      </Avatar>

      <div className="ml-2 w-full">
        <p className="text-sm font-semibold">{freelancer.name}</p>
        <p className="text-xs">male</p>
      </div>
    </div>
  );
}

interface ListingPageComponentProps {
  id: string;
}
export default function ListingPageComponent(props: ListingPageComponentProps) {
  const { id } = props;
  const { user, loading } = useContext(UserContext);
  const [listing, setListing] = useState<ListingDto | null>();
  const [applicants, setApplicants] = useState<User[]>([]);
  const [freelancer, setFreelancer] = useState<User | null>(null);
  const [pictures, setPictures] = useState<string[]>([]);
  const [completionPictures, setCompletionPictures] = useState<string[]>([]);
  const [lister, setLister] = useState<User | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLong, setUserLong] = useState<number | null>(null);
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
      window.location.href = "/login";
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

      let pics = listing.pictures?.map((pic) => {
        return getPictureUrl(pic);
      });
      setPictures(pics);

      if (listing.completion_pictures.length > 0) {
        let pics = listing.completion_pictures.map((pic) => {
          return getCompletionPictureUrl(pic);
        });
        setCompletionPictures(pics);
      }

      const listerRes = await backendFetch(
        "/users/" + listing.lister,
        "GET",
        "application/json",
      );
      const listerJson = await listerRes.json();
      const lister: User = listerJson as User;
      setLister(lister);

      if (listing.lister == user.appwrite["$id"]) {
        const applicantsRes = await backendFetch(
          "/listings/" + id + "/applicants",
          "GET",
          "application/json",
        );
        const applicantsJson = await applicantsRes.json();
        setApplicants(applicantsJson as User[]);
      }

      let pos = navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLong(pos.coords.longitude);
        },
        (e) => {
          console.log(e);
        },
      );

      if (listing.freelancer) {
        const freelancerRes = await backendFetch(
          "/users/" + listing.freelancer!,
          "GET",
          "application/json",
        );
        const freelancerJson = await freelancerRes.json();
        const freelancer = freelancerJson as User;
        setFreelancer(freelancer);
      }
    })();
  }, [user, loading]);

  if (loading || !listing) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mx-auto">
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-10 p-1 bg-black/50 rounded-full "
      >
        <div>
          <LucideChevronLeft className="w-5 h-5 text-white" />
        </div>
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
        <div>
          <div className="flex gap-2">
            {userLat && userLong && (
              <p className="text-xs">
                {Math.trunc(
                  calculateDistance(
                    listing.latitude,
                    listing.longitude,
                    userLat,
                    userLong,
                  ),
                )}
                m
              </p>
            )}

            <p className="text-xs">
              <TimeAgo timestamp={new Date(listing.created_at)} /> ago
            </p>
          </div>
        </div>

        {freelancer && (
          <div className="mt-4">
            <p className="text-lg font-semibold">Freelancer</p>
            <FreelancerCard freelancer={freelancer} />
          </div>
        )}

        {(listing.status == "AWAITREVIEW" || listing.status == "COMPLETED") && (
          <div className="mt-4">
            <p className="text-lg font-semibold">Completion Proofs</p>
            <PicturesCarousel pictures={completionPictures} />
          </div>
        )}
        {listing.lister == user.appwrite["$id"] && applicants.length != 0 && (
          <div className="mt-4">
            <p className="text-lg font-semibold">Applicants</p>
            {applicants.map((app, i) => {
              return (
                <ApplicantCard
                  listing={listing}
                  applicant={app}
                  applicantId={listing.applicants[i]}
                  disabled={listing.status != "LISTED"}
                />
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <p className="whitespace-pre-wrap">{listing.description}</p>
        </div>

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

          {listing.status == "LISTED" &&
            listing.lister != user.appwrite["$id"] &&
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

          {listing.status == "INPROGRESS" &&
            listing.freelancer == user.appwrite["$id"] && (
              <CompletionButton listing={listing} />
            )}

          {listing.status == "AWAITREVIEW" &&
            listing.freelancer == user.appwrite["$id"] && (
              <Button disabled={true} className="bg-blue-900 text-xs h-12">
                Awaiting review
              </Button>
            )}

          {listing.status == "AWAITREVIEW" &&
            listing.lister == user.appwrite["$id"] && (
              <ApproveButton listing={listing} />
            )}

          {listing.status == "COMPLETED" && (
            <p className="text-green-700 font-bold">COMPLETED</p>
          )}
        </div>
      </div>
    </div>
  );
}
