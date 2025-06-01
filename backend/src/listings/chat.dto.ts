export class ChatDto {
  readonly sender: string;
  readonly listing: string;
  readonly message: string;
  constructor(partial: Partial<ChatDto>) {
    Object.assign(this, partial);
  }
}
