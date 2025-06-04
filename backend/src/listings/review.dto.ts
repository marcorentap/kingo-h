export class ReviewDto {
  readonly id: string;
  readonly reviewer: string;
  readonly reviewee: string;
  readonly rating: number;
  readonly review: string;

  constructor(partial: Partial<ReviewDto>) {
    Object.assign(this, partial);
  }
}
