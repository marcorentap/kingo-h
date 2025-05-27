"use client";
import { UserContext } from "@/app/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient } from "@/lib/appwrite";
import { Account, AppwriteException, Client } from "appwrite";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import LoginLayout from "./layout";

type LoginInputs = {
  email: string;
  password: string;
};
export default function LoginPage() {
  const { user, loading } = useContext(UserContext);
  const [errorText, setErrorText] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInputs>();

  useEffect(() => {
    if (!loading && user) {
      // User has existing session. Redirect to homepage
      window.location.href = "/";
    }
  }, [user, loading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    const client = getAppwriteClient();
    const account = new Account(client);

    try {
      await account.createEmailPasswordSession(data.email, data.password);
      window.location.href = "/dashboard"; // Hard refresh
    } catch (e) {
      if (e instanceof AppwriteException) {
        if (e.code == 401) {
          setErrorText("Invalid credentials.");
        }
      }
    }
  };

  return (
    <div>
      <img src={"logo.png"} alt={""} width="100%" />
      <p>{errorText}</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          <div>
            SKKU Email
            <Input
              placeholder="Enter your SKKU email"
              {...register("email", { required: true })}
            />
          </div>
          <div>
            Password
            <Input
              type="password"
              placeholder="Enter your password"
              {...register("password", { required: true })}
            />
          </div>
        </div>

        <div className="flex justify-end mt-1">
          <Link className="text-xs text-blue-500" href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full mt-4 bg-blue-900">
          Login
        </Button>

        <div className="mt-4 text-center text-xs">
          <Link href="/register">Create new account</Link>
        </div>
      </form>
    </div>
  );
}
