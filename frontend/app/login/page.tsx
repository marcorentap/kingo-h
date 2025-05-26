"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient } from "@/lib/appwrite";
import { Account, AppwriteException, Client } from "appwrite";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type LoginInputs = {
  email: string;
  password: string;
};
export default function LoginPage() {
  const [errorText, setErrorText] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInputs>();

  useEffect(() => {
    (async () => {
      const client = getAppwriteClient();
      const account = new Account(client);
      try {
        // User has existing session. Redirect to homepage
        await account.get();
        router.push("/");
      } catch (e) {
        // User has no existing session. Do nothing.
      }
    })();
  }, []);

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    const client = getAppwriteClient();
    const account = new Account(client);

    try {
      await account.createEmailPasswordSession(data.email, data.password);
      router.push("/");
    } catch (e) {
      if (e instanceof AppwriteException) {
        if (e.code == 401) {
          setErrorText("Invalid credentials.");
        }
      }
    }
  };

  return (
    <>
      <p>{errorText}</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        Email: <Input {...register("email", { required: true })} />
        Password:{" "}
        <Input type="password" {...register("password", { required: true })} />
        <Button type="submit">Login</Button>
        <Link href="/register"> Create account </Link>
      </form>
    </>
  );
}
