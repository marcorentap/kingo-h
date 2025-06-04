export class ApproveCompletionDto {
  readonly rating: number;
  readonly review: string;

  constructor(partial: Partial<ApproveCompletionDto>) {
    Object.assign(this, partial);
  }
}
