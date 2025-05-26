export class DBListingDto {
  constructor(
    readonly lister: string,
    readonly title: string,
    readonly description: string,
    readonly pictures: string[],
    readonly status:
      | 'LISTED'
      | 'INPROGRESS'
      | 'AWAITREVIEW'
      | 'COMPLETED' = 'LISTED',
    readonly applicants?: string[],
    readonly freelancer?: string,
  ) {}
}
