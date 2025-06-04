export class Comment {
  readonly id: string;
  readonly user: string;
  readonly comment: string;
  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
  }
}
