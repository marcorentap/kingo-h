export class CreateUserDto {
  constructor(
    readonly name: string,
    readonly campus: string,
  ) {}
}
