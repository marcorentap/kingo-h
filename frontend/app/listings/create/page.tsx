"use client";

import { UserContext } from "@/app/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { backendFetch } from "@/lib/backend";
import { LucideHome } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type CreateListingInputs = {
  title: string;
  description: string;
  payment: number;
  files: File[];
};

export default function CreateListingsPage() {
  const { user } = useContext(UserContext);
  const { register, handleSubmit } = useForm<CreateListingInputs>();
  const router = useRouter();

  const onSubmit: SubmitHandler<CreateListingInputs> = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("payment", data.payment.toString());

    let fileList = data.files;
    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]); // match 'files' field name expected by FilesInterceptor
    }

    let pos = navigator.geolocation.getCurrentPosition(
      (pos) => {
        formData.append("longitude", pos.coords.longitude.toString());
        formData.append("latitude", pos.coords.latitude.toString());
      },
      (e) => {
        console.log(e);
      },
    );

    const res = await backendFetch("/listings", "POST", null, formData);
    if (res.ok) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <>
      <div className="flex h-14 items-center mt-4 w-full">
        <Link href="/dashboard" className="text-gray-500">
          <LucideHome />
        </Link>
        <h2 className="text-xl ml-2 font-bold grow">Create Listing</h2>
        <Link href="/profile">
          <Avatar>
            <AvatarImage src={user?.profile_picture} />
            <AvatarFallback>
              <img src="/default_avatar.png" />
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      <form encType="multipart/form-data" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          <div>
            Title
            <Input placeholder="Enter listing title" {...register("title")} />
          </div>
          <div>
            Description
            <Textarea
              className="h-32"
              placeholder="Enter listing description"
              {...register("description")}
            />
          </div>
          <div>
            Pictures
            <Input
              type="file"
              multiple={true}
              accept="image/*"
              {...register("files")}
            />
          </div>
          <div>
            Payment
            <div className="flex items-center">
              <Input {...register("payment")} />
              <p className="ml-2">won</p>
            </div>
          </div>
        </div>

        <Button type="submit" className="mt-4 text-xs bg-blue-900 w-xs h-12">
          Submit
        </Button>
      </form>
    </>
  );
}
