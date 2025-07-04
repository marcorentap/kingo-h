import { Review } from "./Review";

export class ListingDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly pictures: string[];
  readonly completion_pictures: string[];
  readonly reviews: Review[];
  readonly status: "LISTED" | "INPROGRESS" | "AWAITREVIEW" | "COMPLETED" =
    "LISTED";
  readonly lister: string;
  readonly payment: number;
  readonly longitude: number;
  readonly latitude: number;
  readonly created_at: Date;
  readonly category:
    | "Labor"
    | "Transport"
    | "Care"
    | "Technical"
    | "Support"
    | "Other";
  readonly comments?: [];
  readonly applicants?: string[];
  readonly freelancer?: string;

  constructor(partial: Partial<ListingDto>) {
    Object.assign(this, partial);
  }
}
