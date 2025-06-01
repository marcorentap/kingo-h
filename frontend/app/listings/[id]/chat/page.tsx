import ChatPageComponent from "./client";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChatPageComponent id={id} />;
}
