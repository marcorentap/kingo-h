export class DBListingDto {
  readonly lister: string;
  readonly title: string;
  readonly description: string;
  readonly pictures: string[];
  readonly payment: number;
  readonly longitude: number;
  readonly latitude: number;
  readonly status: 'LISTED' | 'INPROGRESS' | 'AWAITREVIEW' | 'COMPLETED' =
    'LISTED';
  readonly applicants?: string[];
  readonly freelancer?: string;
  readonly category:
    | 'Labor'
    | 'Transport'
    | 'Care'
    | 'Technical'
    | 'Support'
    | 'Other';

  constructor(partial: Partial<DBListingDto>) {
    Object.assign(this, partial);
  }
}
