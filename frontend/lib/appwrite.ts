import { Client } from "appwrite";

export function getAppwriteClient(): Client {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

  const client = new Client().setEndpoint(endpoint).setProject(project);
  return client;
}
