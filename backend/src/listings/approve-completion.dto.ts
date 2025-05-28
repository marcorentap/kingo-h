export class ApproveCompletionDto {
  readonly rating: number;

  constructor(partial: Partial<ApproveCompletionDto>) {
    Object.assign(this, partial);
  }
}
