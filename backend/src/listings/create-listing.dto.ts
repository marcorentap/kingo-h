export class CreateListingDto {
  constructor(
    readonly title: string,
    readonly description: string,
    readonly files: File[],
  ) {}
}
