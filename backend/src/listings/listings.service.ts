import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatorType, Databases, ID, Users } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { DBListingDto } from 'src/appwrite/db-listing.dto';
import { ListingDto } from './listing.dto';
import { UserDto } from 'src/users/user.dto';

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

  async selectFreelancer(id: string, userId: string, freelancerId: string) {
    const db = new Databases(this.appwriteService.getClient());
    const doc = await this.appwriteService.getListingDoc(id);
    if (doc['lister']['$id'] != userId) {
      return HttpStatus.UNAUTHORIZED;
    }

    console.log(freelancerId);
    if (!freelancerId) {
      return HttpStatus.BAD_REQUEST;
    }

    return this.appwriteService.selectFreelancer(id, userId, freelancerId);
  }

  async getListing(id: string) {
    const doc = await this.appwriteService.getListingDoc(id);
    return new ListingDto({
      id: doc['$id'],
      title: doc['title'],
      description: doc['description'],
      pictures: doc['pictures'],
      status: doc['status'],
      lister: doc['lister']['$id'],
      payment: doc['payment'],
      longitude: doc['longitude'],
      latitude: doc['latitude'],
      applicants: doc['applicants'].map((app) => app['$id']),
      freelancer: doc['freelancer']['$id'],
    });
  }

  async getListingApplicants(id: string) {
    const client = this.appwriteService.getClient();
    const doc = await this.appwriteService.getListingDoc(id);
    const users = new Users(client);
    const dbApplicants = doc['applicants'];
    const applicantNames = {};

    const promises = dbApplicants.map(async (app) => {
      const applicantId = app['$id'];
      if (!applicantNames[applicantId]) {
        const authApplicants = await users.get(applicantId);
        applicantNames[applicantId] = authApplicants.name;
      }

      return new UserDto({
        name: applicantNames[applicantId],
        campus: app.campus,
        profile_picture: app.profile_picture,
      });
    });

    const applicantDtos = await Promise.all(promises);
    return applicantDtos;
  }

  async getUserListings(userId: string) {
    const docs = await this.appwriteService.getUserListingDocs(userId);

    const dtos = await Promise.all(
      docs.documents.map(async (doc) => {
        return new ListingDto({
          id: doc['$id'],
          title: doc['title'],
          description: doc['description'],
          pictures: doc['pictures'],
          status: doc['status'],
          lister: doc['lister']['$id'],
          payment: doc['payment'],
          longitude: doc['longitude'],
          latitude: doc['latitude'],
          applicants: doc['applicants'].map((app) => app['$id']),
          freelancer: doc['freelancer']['$id'],
        });
      }),
    );

    return dtos;
  }

  async getListings() {
    const docs = await this.appwriteService.getListingDocs();

    const dtos = await Promise.all(
      docs.documents.map(async (doc) => {
        return new ListingDto({
          id: doc['$id'],
          title: doc['title'],
          description: doc['description'],
          pictures: doc['pictures'],
          status: doc['status'],
          lister: doc['lister']['$id'],
          payment: doc['payment'],
          longitude: doc['longitude'],
          latitude: doc['latitude'],
          applicants: doc['applicants'].map((app) => app['$id']),
          freelancer: doc['freelancer']['$id'],
        });
      }),
    );

    return dtos;
  }
}
