export class SelectFreelancerDto {
  readonly freelancerId: string;

  constructor(partial: Partial<SelectFreelancerDto>) {
    Object.assign(this, partial);
  }
}
