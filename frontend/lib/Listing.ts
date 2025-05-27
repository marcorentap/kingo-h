export class ListingDto {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly pictures: string[],
    readonly status:
      | "LISTED"
      | "INPROGRESS"
      | "AWAITREVIEW"
      | "COMPLETED" = "LISTED",
    readonly lister: string,
    readonly payment: number,
    readonly longitude: number,
    readonly latitude: number,
    readonly applicants?: string[],
    readonly freelancer?: string,
  ) {}
}
