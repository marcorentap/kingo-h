import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Databases, ID, Query, Storage } from 'node-appwrite';
import { DBUserDto } from './db-user.dto';
import { DBListingDto } from './db-listing.dto';

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

  async getListingDocs(limit: number = 25, offset: number = 0) {
    const db = new Databases(this.client);
    const docs = await db.listDocuments(this.dbId, 'listings', [
      Query.limit(limit),
      Query.offset(offset),
    ]);

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

  async getUserListingDocs(userId: string, limit: number, offset: number) {
    const db = new Databases(this.client);
    return await db.listDocuments(this.dbId, 'listings', [
      Query.limit(limit),
      Query.offset(offset),
      Query.equal('lister', userId),
    ]);
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

  async markListingApproved(id: string, rating: number) {
    const db = new Databases(this.client);
    return await db.updateDocument(this.dbId, 'listings', id, {
      status: 'COMPLETED',
      rating: Number(rating),
    });
  }
}
