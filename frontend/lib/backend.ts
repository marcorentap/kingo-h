import { Account } from "appwrite";
import { getAppwriteClient } from "./appwrite";

export async function backendFetch(
  relativeUrl: string,
  method: string = "GET",
  body?: any,
) {
  const account = new Account(getAppwriteClient());
  const { jwt } = await account.createJWT();
  const backendEndpoint = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
  const res = await fetch(backendEndpoint + relativeUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    method: method,
    body: JSON.stringify(body),
  });

  return res;
}
