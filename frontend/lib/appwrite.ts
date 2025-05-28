import { Client } from "appwrite";
import { Storage } from "appwrite";

export function getAppwriteClient(): Client {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

  const client = new Client().setEndpoint(endpoint).setProject(project);
  return client;
}
export function getPictureUrl(id: string) {
  const client = getAppwriteClient();
  const storage = new Storage(client);
  return storage.getFileDownload("listings", id);
}

export function getCompletionPictureUrl(id: string) {
  const client = getAppwriteClient();
  const storage = new Storage(client);
  return storage.getFileDownload("completion", id);
}
