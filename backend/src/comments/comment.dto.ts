export class CommentDto {
  readonly id: string;
  readonly user: string;
  readonly comment: string;
  readonly listing: string;
  constructor(partial: Partial<CommentDto>) {
    Object.assign(this, partial);
  }
}
