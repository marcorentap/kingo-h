import { getPictureUrl } from "@/lib/appwrite";
import { ListingDto } from "@/lib/Listing";
import { calculateDistance, TimeAgo } from "@/lib/utils";
import { LucideMessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface ListingCardProps {
  listing: ListingDto;
  userLongitude: number;
  userLatitude: number;
}
export function ListingCard(props: ListingCardProps) {
  const { listing, userLongitude, userLatitude } = props;
  const [distanceM, setDistanceM] = useState<number>(0);

  useEffect(() => {
    setDistanceM(
      calculateDistance(
        listing.latitude,
        listing.longitude,
        userLatitude,
        userLongitude,
      ),
    );
  }, []);

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
              {userLatitude && userLongitude && distanceM > 1000
                ? (distanceM / 1000).toFixed(2)
                : Math.trunc(distanceM)}
              {distanceM > 1000 ? "km" : "m"}
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
        <div className="flex justify-between items-center">
          <div className="bg-gray-300 p-1.5 rounded-full">
            <p className="text-xs font-semibold leading-none">
              {listing.category}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-xs mr-1 font-semibold leading-none">
              {listing.comments?.length}
            </p>
            <LucideMessageSquare className="w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
