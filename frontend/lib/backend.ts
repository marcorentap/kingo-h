import { Account } from "appwrite";
import { getAppwriteClient } from "./appwrite";

export async function backendFetch(
  relativeUrl: string,
  method: string = "GET",
  contentType: string | null,
  body?: any,
) {
  const account = new Account(getAppwriteClient());
  const { jwt } = await account.createJWT();
  const backendEndpoint = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;

  if (contentType) {
    const res = await fetch(backendEndpoint + relativeUrl, {
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${jwt}`,
      },
      method: method,
      body: body,
    });
    return res;
  } else {
    const res = await fetch(backendEndpoint + relativeUrl, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      method: method,
      body: body,
    });
    return res;
  }
}
