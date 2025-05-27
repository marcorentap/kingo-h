export class UserDto {
  readonly name: string;
  readonly campus: string;
  readonly profile_picture: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
