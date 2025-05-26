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
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { backendFetch } from "@/lib/backend";

type RegisterInputs = {
  name: string;
  email: string;
  password: string;
  campus: "Natural Science" | "Humanities and Social Science";
};

export default function RegisterPage() {
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

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    const client = getAppwriteClient();
    const account = new Account(client);
    const backendEndpoint = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;

    try {
      await account.create(ID.unique(), data.email, data.password, data.name);
      await account.createEmailPasswordSession(data.email, data.password);
      await backendFetch("/users", "POST", {
        profile_picture: "",
        campus: data.campus,
      });
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
        Password:
        <Input type="password" {...register("password", { required: true })} />
        Name: <Input {...register("name", { required: true })} />
        Campus:
        <Controller
          control={control}
          name="campus"
          rules={{ required: true }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NATURALSCIENCE">Natural Science</SelectItem>
                <SelectItem value="HUMANITIES">
                  Humanities and Social Science
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <br />
        <Button type="submit">Register</Button>
        <Link href="/login"> Have an account? Login </Link>
      </form>
    </>
  );
}
