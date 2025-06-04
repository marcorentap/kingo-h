import OtherProfilePageClient from "./client";
import ListingPageComponent from "./client";

export default async function OtherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OtherProfilePageClient id={id} />;
}
