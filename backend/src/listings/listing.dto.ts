import { ReviewDto } from './review.dto';

export class ListingDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly pictures: string[];
  readonly completion_pictures: string[];
  readonly reviews: ReviewDto[];
  readonly status: 'LISTED' | 'INPROGRESS' | 'AWAITREVIEW' | 'COMPLETED' =
    'LISTED';
  readonly lister: string;
  readonly payment: number;
  readonly longitude: number;
  readonly latitude: number;
  readonly created_at: Date;
  readonly comments?: [];
  readonly applicants?: string[];
  readonly freelancer?: string;
  readonly category:
    | 'Labor'
    | 'Transport'
    | 'Care'
    | 'Technical'
    | 'Support'
    | 'Other';
  constructor(partial: Partial<ListingDto>) {
    Object.assign(this, partial);
  }
}
