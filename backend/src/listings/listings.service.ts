import { HttpStatus, Injectable } from '@nestjs/common';
import { Databases, ID } from 'node-appwrite';
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
    longitude: number,
    latitude: number,
    payment: number,
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
      new DBListingDto({
        lister: userId,
        title: title,
        description: description,
        latitude: latitude,
        longitude: longitude,
        payment: payment,
        pictures: uploadedFileIds,
      }),
    );
    return {};
  }

  async applyToListing(id: string, userId: string) {
    const doc = await this.appwriteService.addListingApplicant(id, userId);
    return HttpStatus.OK;
  }

  async getListing(id: string) {
    const doc = await this.appwriteService.getListingDoc(id);
    return new ListingDto(
      doc['$id'],
      doc['title'],
      doc['description'],
      doc['pictures'],
      doc['status'],
      doc['lister']['$id'],
      doc['payment'],
      doc['longitude'],
      doc['latitude'],
      doc['applicants'].map((app) => app['$id']),
      doc['freelancer']['$id'],
    );
  }

  async getUserListings(userId: string) {
    const docs = await this.appwriteService.getUserListingDocs(userId);

    const dtos = await Promise.all(
      docs.documents.map(async (doc) => {
        return new ListingDto(
          doc['$id'],
          doc['title'],
          doc['description'],
          doc['pictures'],
          doc['status'],
          doc['lister']['$id'],
          doc['payment'],
          doc['longitude'],
          doc['latitude'],
          doc['applicants'].map((app) => app['$id']),
          doc['freelancer']['$id'],
        );
      }),
    );

    return dtos;
  }

  async getListings() {
    const docs = await this.appwriteService.getListingDocs();

    const dtos = await Promise.all(
      docs.documents.map(async (doc) => {
        return new ListingDto(
          doc['$id'],
          doc['title'],
          doc['description'],
          doc['pictures'],
          doc['status'],
          doc['lister']['$id'],
          doc['payment'],
          doc['longitude'],
          doc['latitude'],
          doc['applicants'].map((app) => app['$id']),
          doc['freelancer']['$id'],
        );
      }),
    );

    return dtos;
  }
}
