"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient } from "@/lib/appwrite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account, AppwriteException, Client, ID } from "appwrite";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { backendFetch } from "@/lib/backend";
import { UserContext } from "@/app/UserContext";
import { Checkbox } from "@/components/ui/checkbox";

type RegisterInputs = {
  name: string;
  email: string;
  password: string;
  agree: boolean;
};

export default function RegisterPage() {
  const { user, loading } = useContext(UserContext);
  const [errorText, setErrorText] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    control,
  } = useForm<RegisterInputs>();

  useEffect(() => {
    if (!loading && user) {
      // User has existing session. Redirect to homepage
      router.push("/");
    }
  }, [user, loading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    const client = getAppwriteClient();
    const account = new Account(client);
    const backendEndpoint = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;

    // TODO: Check if user agrees to terms

    try {
      await account.create(ID.unique(), data.email, data.password, data.name);
      await account.createEmailPasswordSession(data.email, data.password);
      await backendFetch(
        "/users",
        "POST",
        "application/json",
        JSON.stringify({
          profile_picture: "",
          campus: "NATURALSCIENCE",
        }),
      );
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
      <img src={"logo.png"} alt={""} width="128px" className="m-auto" />
      <p>{errorText}</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          <div>
            Name
            <Input
              placeholder="Enter your full name"
              {...register("name", { required: true })}
            />
          </div>
          <div>
            Email
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

        <Controller
          name="agree"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="terms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
              <div className="text-xs">
                I agree to the Terms of Service, including the escrow payment
                policy and privacy notice.
                {errors.agree && (
                  <p className="text-red-500">You must agree to continue.</p>
                )}
              </div>
            </div>
          )}
        />

        <Button type="submit" className="w-full mt-4 bg-blue-900">
          Create Account
        </Button>

        <div className="mt-4 text-center text-xs">
          <Link href="/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}
