"use client";

import { UserContext } from "@/app/UserContext";
import { getAppwriteClient } from "@/lib/appwrite";
import { backendFetch } from "@/lib/backend";
import { ListingDto } from "@/lib/Listing";
import { useContext, useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LucideChevronLeft, SendHorizonal } from "lucide-react";
import { User } from "@/lib/User";
import { SubmitHandler, useForm } from "react-hook-form";
import { Chat } from "@/lib/Chat";

type ChatLineProps = {
  chat: Chat;
  user: User;
};
function ChatLine(props: ChatLineProps) {
  const { chat, user } = props;

  if (user.appwrite["$id"] == chat.sender) {
    return (
      <div className="flex justify-end">
        <div className="bg-green-500 rounded-full text-sm px-2 py-1 inline-block">
          <p>{chat.message}</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-300 rounded-full text-sm px-2 py-1 inline-block">
          <p>{chat.message}</p>
        </div>
      </div>
    );
  }
}

type ChatPageComponentProps = {
  id: string;
};

interface ChatInputs {
  message: string;
}

export default function ChatPageComponent(props: ChatPageComponentProps) {
  const { id } = props;
  const { user, loading } = useContext(UserContext);
  const [listing, setListing] = useState<ListingDto | null>();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<"LISTER" | "FREELANCER" | null>(null);
  const [lister, setLister] = useState<User | null>(null);
  const [freelancer, setFreelancer] = useState<User | null>(null);
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    control,
  } = useForm<ChatInputs>();

  function appendChat(chat: Chat) {
    setChats((currentChats) => {
      console.log(currentChats); // This will now log the latest state
      return [...currentChats, chat];
    });
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

      const listerRes = await backendFetch(
        "/users/" + listing.lister,
        "GET",
        "application/json",
      );
      const listerJson = await listerRes.json();
      setLister(listerJson as User);

      const freelancerRes = await backendFetch(
        "/users/" + listing.freelancer!,
        "GET",
        "application/json",
      );
      const freelancerJson = await freelancerRes.json();
      setFreelancer(freelancerJson as User);

      const chatsRes = await backendFetch(
        "/listings/" + id + "/chats",
        "GET",
        "application/json",
      );
      const chatsJson = await chatsRes.json();
      setChats(chatsJson as Chat[]);

      if (
        listing.lister !== user.appwrite["$id"] &&
        listing.freelancer !== user.appwrite["$id"]
      ) {
        window.location.href = "/dashboard";
      }

      if (listing.lister == user.appwrite["$id"]) setRole("LISTER");
      if (listing.freelancer == user.appwrite["$id"]) setRole("FREELANCER");

      const client = getAppwriteClient();
      client.subscribe("databases.default.collections.chats.documents", (d) => {
        if (d.payload["listing"]["$id"] != listing.id) return;
        if (
          d.events.includes(
            "databases.default.collections.chats.documents.*.create",
          )
        ) {
          const chat = d.payload;
          appendChat(
            new Chat({
              sender: chat["sender"],
              message: chat["message"],
              listing: chat["listing"]["$id"],
            }),
          );
        }
      });
    })();
  }, [user, loading]);

  if (loading || !listing) {
    return <p>Loading...</p>;
  }

  const onSubmit: SubmitHandler<ChatInputs> = async (data) => {
    const res = await backendFetch(
      "/listings/" + listing.id + "/chats",
      "POST",
      "application/json",
      JSON.stringify(data),
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-10 p-1 bg-black/50 rounded-full "
      >
        <div>
          <LucideChevronLeft className="w-5 h-5 text-white" />
        </div>
      </button>

      <div className="text-center text-xl my-2 ">
        {role == "LISTER" && freelancer?.name}
        {role == "FREELANCER" && lister?.name}
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto rounded p-2 space-y-2"
      >
        {chats.map((c) => {
          return <ChatLine user={user} chat={c} />;
        })}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="sticky bottom-0 bg-white my-4 flex items-center space-x-2">
          <Input
            placeholder="Type your message..."
            {...register("message", { required: true })}
          />
          <button type="submit" className="cursor-pointer">
            <div className="text-gray-500">
              <SendHorizonal />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
