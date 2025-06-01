export class CreateChatDto {
  readonly message: string;
  constructor(partial: Partial<CreateChatDto>) {
    Object.assign(this, partial);
  }
}
