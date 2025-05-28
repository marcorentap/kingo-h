export class MarkListingCompleteDto {
  readonly files: File[];

  constructor(partial: Partial<MarkListingCompleteDto>) {
    Object.assign(this, partial);
  }
}
