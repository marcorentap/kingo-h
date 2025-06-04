import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatorType, Databases, ID, Models, Users } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { DBListingDto } from 'src/appwrite/db-listing.dto';
import { ListingDto } from './listing.dto';
import { UserDto } from 'src/users/user.dto';
import { ReviewDto } from './review.dto';

@Injectable()
export class ListingsService {
  constructor(readonly appwriteService: AppwriteService) {}

  reviewDocToDto(doc: Models.Document) {
    return new ReviewDto({
      id: doc['$id'],
      reviewer: doc['reviewer'],
      reviewee: doc['reviewee'],
      rating: doc['rating'],
      review: doc['review'],
    });
  }

  listingDocToDto(doc: Models.Document) {
    return new ListingDto({
      id: doc['$id'],
      title: doc['title'],
      description: doc['description'],
      pictures: doc['pictures'],
      completion_pictures: doc['completion_pictures'],
      status: doc['status'],
      lister: doc['lister']['$id'],
      payment: doc['payment'],
      longitude: doc['longitude'],
      latitude: doc['latitude'],
      comments: doc['comments'],
      category: doc['category'],
      reviews: doc['reviews'].map((r) => {
        return this.reviewDocToDto(r);
      }),
      applicants: doc['applicants'].map((app) => app['$id']),
      freelancer: doc['freelancer'] ? doc['freelancer']['$id'] : null,
      created_at: new Date(doc['$createdAt']),
    });
  }

  async createListing(
    userId: string,
    title: string,
    description: string,
    longitude: number,
    latitude: number,
    payment: number,
    category:
      | 'Labor'
      | 'Transport'
      | 'Care'
      | 'Technical'
      | 'Support'
      | 'Other',
    files: Express.Multer.File[],
  ) {
    const uploadPromises = files.map(async (file) => {
      const f = new File([file.buffer], file.filename);
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
        category: category,
        pictures: uploadedFileIds,
      }),
    );
    return HttpStatus.OK;
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

    if (!freelancerId) {
      return HttpStatus.BAD_REQUEST;
    }

    return this.appwriteService.selectFreelancer(id, userId, freelancerId);
  }

  async getListing(id: string) {
    const doc = await this.appwriteService.getListingDoc(id);
    return this.listingDocToDto(doc);
  }

  async markListingComplete(
    freelancerId: string,
    id: string,
    files: Express.Multer.File[],
  ) {
    const db = new Databases(this.appwriteService.getClient());
    const doc = await this.appwriteService.getListingDoc(id);
    if (doc['freelancer']['$id'] != freelancerId) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (!freelancerId) {
      return HttpStatus.BAD_REQUEST;
    }

    const uploadPromises = files.map(async (file) => {
      const f = new File([file.buffer], file.filename);
      const uploaded = await this.appwriteService.uploadCompletionPicture(f);
      return uploaded['$id'];
    });

    const uploadedFileIds = await Promise.all(uploadPromises);
    await this.appwriteService.markListingComplete(id, uploadedFileIds);
    return HttpStatus.OK;
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
        return this.listingDocToDto(doc);
      }),
    );

    return dtos;
  }

  async getListings(
    filterSearch: string | undefined,
    filterCategory: string | undefined,
    filterMaxDistance: number | undefined,
    filterStatus: string | undefined,
  ) {
    let docs: Models.DocumentList<Models.Document>;
    if (filterSearch || filterCategory || filterMaxDistance || filterStatus) {
      docs = await this.appwriteService.getFilteredListingDocs(
        filterSearch,
        filterCategory,
        filterMaxDistance,
        filterStatus,
      );
    } else {
      docs = await this.appwriteService.getListingDocs();
    }

    const dtos = await Promise.all(
      docs.documents.map(async (doc) => {
        return this.listingDocToDto(doc);
      }),
    );

    return dtos;
  }

  async rateLister(id: string, userId: string, rating: number, review: string) {
    const db = new Databases(this.appwriteService.getClient());
    const doc = await this.appwriteService.getListingDoc(id);
    if (doc['freelancer']['$id'] != userId) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (!rating) {
      return HttpStatus.BAD_REQUEST;
    }

    return await this.appwriteService.createReview(
      id,
      doc['freelancer']['$id'],
      doc['lister']['$id'],
      rating,
      review,
    );
  }

  async approveCompletion(
    id: string,
    userId: string,
    rating: number,
    review: string,
  ) {
    const db = new Databases(this.appwriteService.getClient());
    const doc = await this.appwriteService.getListingDoc(id);
    if (doc['lister']['$id'] != userId) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (!rating) {
      return HttpStatus.BAD_REQUEST;
    }

    await this.appwriteService.createReview(
      id,
      doc['lister']['$id'],
      doc['freelancer']['$id'],
      rating,
      review,
    );

    return this.appwriteService.markListingApproved(id);
  }

  async addCommentToListing(id: string, userId: string, comment: string) {
    const commentDoc = await this.appwriteService.createComment(
      userId,
      comment,
    );
    return await this.appwriteService.addCommentToListing(
      id,
      commentDoc['$id'],
    );
  }

  async addChatToListing(id: string, userId: string, message: string) {
    return await this.appwriteService.createChat(id, userId, message);
  }

  async getListingChats(id: string) {
    return await this.appwriteService.getListingChats(id);
  }
}
