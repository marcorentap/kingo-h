import { Injectable } from '@nestjs/common';
import { Databases, Models, Users } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { UserDto } from './user.dto';
import { CreateUserDto } from './create-user.dto';
import { DBUserDto } from 'src/appwrite/db-user.dto';
import { ReviewDto } from 'src/listings/review.dto';

@Injectable()
export class UsersService {
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

  async getUser(userId: string) {
    const client = this.appwriteService.getClient();
    const users = new Users(client);
    const db = new Databases(client);
    const authUser = await users.get(userId);
    const dbUser = await this.appwriteService.getUser(userId);
    return new UserDto({
      name: authUser.name,
      campus: dbUser.campus,
      profile_picture: dbUser.profile_picture,
    });
  }

  async getUserRatings(userId: string) {
    const docs = await this.appwriteService.getUserRatings(userId);
    return docs.documents.map((r) => {
      return this.reviewDocToDto(r);
    });
  }

  async createUser(userId: string, dto: DBUserDto) {
    return await this.appwriteService.createUser(userId, dto);
  }
}
