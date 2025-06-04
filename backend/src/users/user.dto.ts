import { Models } from 'node-appwrite';

export class UserDto {
  readonly name: string;
  readonly campus: string;
  readonly profile_picture: string;
  readonly appwrite: Models.User<Models.Preferences>;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
