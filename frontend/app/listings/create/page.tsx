"use client";

import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { UserContext } from "@/app/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { backendFetch } from "@/lib/backend";
import { LucideHome } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import dynamic from "next/dynamic";

type CreateListingInputs = {
  title: string;
  description: string;
  payment: number;
  files: File[];
};

declare global {
  interface Window {
    google: any;
  }
}

function LocationPicker({ onSelect }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google!) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const initialLat = position.coords.latitude;
        const initialLng = position.coords.longitude;

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 14,
          disableDefaultUI: true, // remove extra controls
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        let marker = new window.google.maps.Marker({
          position: { lat: initialLat, lng: initialLng },
          map,
        });

        onSelect({ lat: initialLat, lng: initialLng });

        map.addListener("click", (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          marker.setPosition({ lat, lng });
          onSelect({ lat, lng });
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );
  }, [onSelect]);

  return (
    <div className="w-full h-64 border rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  );
}

export default function CreateListingsPage() {
  const { user } = useContext(UserContext);
  const { register, handleSubmit } = useForm<CreateListingInputs>();
  const router = useRouter();

  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
  });

  const onSubmit: SubmitHandler<CreateListingInputs> = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("payment", data.payment.toString());

    let fileList = data.files;
    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]);
    }

    if (selectedLocation.lat !== null && selectedLocation.lng !== null) {
      formData.append("latitude", selectedLocation.lat.toString());
      formData.append("longitude", selectedLocation.lng.toString());
    }

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
            Select Location
            {window.google && <LocationPicker onSelect={setSelectedLocation} />}
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
