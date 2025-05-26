import { Models } from "appwrite";

export class User {
  constructor(
    readonly name: string,
    readonly appwrite: Models.User<Models.Preferences>,
    readonly profile_picture: string = "/default_avatar.png",
  ) {}
}
