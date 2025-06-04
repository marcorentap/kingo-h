import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Databases, ID, Query, Storage } from 'node-appwrite';
import { DBUserDto } from './db-user.dto';
import { DBListingDto } from './db-listing.dto';
import { CommentDto } from 'src/comments/comment.dto';
import { ChatDto } from 'src/listings/chat.dto';

@Injectable()
export class AppwriteService {
  readonly client: Client;
  readonly dbId: string;
  constructor(configService: ConfigService) {
    const endpoint = configService.getOrThrow('APPWRITE_ENDPOINT');
    const project = configService.getOrThrow('APPWRITE_PROJECT');
    const key = configService.getOrThrow('APPWRITE_KEY');
    this.dbId = configService.getOrThrow('APPWRITE_DB');

    this.client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(key);
  }

  getClient(): Client {
    return this.client;
  }

  async getComment(commentId: string) {
    const db = new Databases(this.client);
    const doc = await db.getDocument(this.dbId, 'comments', commentId);
    return new CommentDto({
      id: doc['$id'],
      user: doc['user'],
      comment: doc['comment'],
    });
  }

  async getUser(userId: string) {
    const db = new Databases(this.client);
    const doc = await db.getDocument(this.dbId, 'users', userId);
    return new DBUserDto(doc['profile_picture'], doc['campus']);
  }

  async patchUser(userId: string, dto: DBUserDto) {}

  async createUser(userId: string, dto: DBUserDto) {
    const db = new Databases(this.client);
    const doc = await db.createDocument(this.dbId, 'users', userId, {
      profile_picture: dto.profile_picture,
      campus: dto.campus,
    });
    return new DBUserDto(doc['profile_picture'], doc['campus']);
  }

  async uploadProfilePicture(userId: string, file: File) {
    const storage = new Storage(this.client);
    const f = await storage.createFile('profile_pictures', userId, file);
    return f;
  }

  async uploadListingPicture(file: File) {
    const storage = new Storage(this.client);
    const f = await storage.createFile('listings', ID.unique(), file);
    return f;
  }

  async createListing(userId: string, dto: DBListingDto) {
    const db = new Databases(this.client);
    const doc = await db.createDocument(
      this.dbId,
      'listings',
      ID.unique(),
      dto,
    );
  }

  async getListingDoc(id: string) {
    const db = new Databases(this.client);
    return await db.getDocument(this.dbId, 'listings', id);
  }

  async getListingDocs(limit: number = 100, offset: number = 0) {
    const db = new Databases(this.client);
    const docs = await db.listDocuments(this.dbId, 'listings', [
      Query.limit(limit),
      Query.offset(offset),
    ]);

    return docs;
  }

  async getFilteredListingDocs(
    search?: string,
    category?: string,
    maxDistance?: number,
    status?: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const db = new Databases(this.client);
    let queries: string[] = [Query.limit(limit), Query.offset(offset)];

    search &&
      queries.push(
        Query.or([
          Query.search('title', search),
          Query.search('description', search),
        ]),
      );

    if (status == 'ONGOING') {
      queries.push(
        Query.or([
          Query.equal('status', 'ONGOING'),
          Query.equal('status', 'AWAITREVIEW'),
        ]),
      );
    } else if (status) {
      queries.push(Query.equal('status', status));
    }

    category && queries.push(Query.equal('category', category));

    maxDistance &&
      queries.push(
        Query.or([
          Query.lessThanEqual('longitude', maxDistance),
          Query.lessThanEqual('latitude', maxDistance),
        ]),
      );

    const docs = await db.listDocuments(this.dbId, 'listings', queries);

    return docs;
  }

  async addListingApplicant(id: string, userId: string) {
    const db = new Databases(this.client);
    const doc = await db.getDocument(this.dbId, 'listings', id);
    let applicants: string[] = doc['applicants'];

    applicants.push(userId);

    return await db.updateDocument(this.dbId, 'listings', id, {
      applicants: applicants,
    });
  }

  async getUserRatings(userId: string) {
    const db = new Databases(this.client);
    const queries = [Query.equal('reviewee', userId)];

    const docs = await db.listDocuments(this.dbId, 'reviews', queries);

    return docs;
  }

  async getUserListingDocs(userId: string, limit?: number, offset?: number) {
    const db = new Databases(this.client);

    const queries = [
      Query.or([
        Query.equal('lister', userId),
        Query.contains('applicants', [userId]),
      ]),
    ];

    if (limit !== undefined) {
      queries.push(Query.limit(limit));
    }

    if (offset !== undefined) {
      queries.push(Query.offset(offset));
    }

    return await db.listDocuments(this.dbId, 'listings', queries);
  }

  async getCanonicalListingPictureUrl(id: string) {
    const storage = new Storage(this.client);
    return await storage.getFileDownload('listings', id);
  }

  async selectFreelancer(id: string, userId: string, freelancerId: string) {
    const db = new Databases(this.client);
    return await db.updateDocument(this.dbId, 'listings', id, {
      freelancer: freelancerId,
      status: 'INPROGRESS',
    });
  }

  async uploadCompletionPicture(file: File) {
    const storage = new Storage(this.client);
    const f = await storage.createFile('completion', ID.unique(), file);
    return f;
  }

  async markListingComplete(id: string, completion_pictures: string[]) {
    const db = new Databases(this.client);
    return await db.updateDocument(this.dbId, 'listings', id, {
      status: 'AWAITREVIEW',
      completion_pictures: completion_pictures,
    });
  }

  async markListingApproved(id: string) {
    const db = new Databases(this.client);
    return await db.updateDocument(this.dbId, 'listings', id, {
      status: 'COMPLETED',
    });
  }

  async createReview(
    listingId: string,
    reviewer: string,
    reviewee: string,
    rating: number,
    review: string,
  ) {
    const db = new Databases(this.client);
    return await db.createDocument(this.dbId, 'reviews', ID.unique(), {
      listing: listingId,
      reviewer: reviewer,
      reviewee: reviewee,
      rating: Number(rating),
      review: review,
    });
  }

  async addCommentToListing(id: string, commentId: string) {
    const listing = await this.getListingDoc(id);
    let comments = listing['comments'];
    comments.push(commentId);

    const db = new Databases(this.client);
    return await db.updateDocument(this.dbId, 'listings', id, {
      comments: comments,
    });
  }

  async createComment(userId: string, comment: string) {
    const db = new Databases(this.client);
    return await db.createDocument(this.dbId, 'comments', ID.unique(), {
      user: userId,
      comment: comment,
    });
  }

  async createChat(listingId: string, userId: string, message: string) {
    const db = new Databases(this.client);
    return await db.createDocument(this.dbId, 'chats', ID.unique(), {
      listing: listingId,
      sender: userId,
      message: message,
    });
  }

  async getListingChats(listingId: string) {
    const db = new Databases(this.client);
    const docs = await db.listDocuments(this.dbId, 'chats', [
      Query.equal('listing', listingId),
    ]);
    return docs.documents.map((doc) => {
      return new ChatDto({
        listing: doc['listing']['$id'],
        sender: doc['sender'],
        message: doc['message'],
      });
    });
  }
}
