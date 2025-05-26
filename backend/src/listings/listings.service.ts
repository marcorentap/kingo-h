import { Injectable } from '@nestjs/common';
import { ID } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { DBListingDto } from 'src/appwrite/db-listing.dto';
import { ListingDto } from './listing.dto';

@Injectable()
export class ListingsService {
  constructor(readonly appwriteService: AppwriteService) {}

  async createListing(
    userId: string,
    title: string,
    description: string,
    files: Express.Multer.File[],
  ) {
    const uploadPromises = files.map(async (file) => {
      const f = new File([file.buffer], title);
      const uploaded = await this.appwriteService.uploadListingPicture(f);
      return uploaded['$id'];
    });

    const uploadedFileIds = await Promise.all(uploadPromises);

    this.appwriteService.createListing(
      userId,
      new DBListingDto(userId, title, description, uploadedFileIds),
    );
    return {};
  }

  async getListing(id: string) {
    const doc = this.appwriteService.getListingDoc(id);
  }

  async getListings() {
    const docs = await this.appwriteService.getListingDocs();

    const dtos = await Promise.all(
      docs.documents.map(async (doc) => {
        return new ListingDto(
          doc['id'],
          doc['title'],
          doc['description'],
          doc['pictures'],
          doc['status'],
          doc['lister']['$id'],
          doc['applicants'],
          doc['freelancer'],
        );
      }),
    );

    return dtos;
  }
}
