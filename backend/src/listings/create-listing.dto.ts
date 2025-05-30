export class CreateListingDto {
  readonly title: string;
  readonly description: string;
  readonly payment: number;
  readonly longitude: number;
  readonly latitude: number;
  readonly category:
    | 'Labor'
    | 'Transport'
    | 'Care'
    | 'Technical'
    | 'Support'
    | 'Other';
  readonly files: File[];

  constructor(partial: Partial<CreateListingDto>) {
    Object.assign(this, partial);
  }
}
