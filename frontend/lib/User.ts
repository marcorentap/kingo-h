import { Models } from "appwrite";

export class User {
  readonly name: string;
  readonly campus: string;
  readonly profile_picture: string;
  readonly appwrite: Models.User<Models.Preferences>;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
