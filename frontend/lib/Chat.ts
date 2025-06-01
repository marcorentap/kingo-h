export class Chat {
  readonly sender: string;
  readonly listing: string;
  readonly message: string;

  constructor(partial: Partial<Chat>) {
    Object.assign(this, partial);
  }
}
