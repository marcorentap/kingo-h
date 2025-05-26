import { Injectable } from '@nestjs/common';
import { Databases, Users } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { UserDto } from './user.dto';
import { CreateUserDto } from './create-user.dto';
import { DBUserDto } from 'src/appwrite/db-user.dto';

@Injectable()
export class UsersService {
  constructor(readonly appwriteService: AppwriteService) {}

  async getUser(userId: string) {
    const client = this.appwriteService.getClient();
    const users = new Users(client);
    const db = new Databases(client);
    const authUser = await users.get(userId);

    return await this.appwriteService.getUser(userId);
  }

  async createUser(userId: string, dto: DBUserDto) {
    return await this.appwriteService.createUser(userId, dto);
  }
}
