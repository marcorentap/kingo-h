import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Databases } from 'node-appwrite';
import { DBUserDto } from './db-user.dto';

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
}
