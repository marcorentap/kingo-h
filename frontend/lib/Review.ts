export class Review {
  readonly id: string;
  readonly reviewer: string;
  readonly reviewee: string;
  readonly rating: number;
  readonly review: string;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
