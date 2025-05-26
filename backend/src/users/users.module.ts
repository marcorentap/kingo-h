import { Module } from '@nestjs/common';
import { AppwriteModule } from 'src/appwrite/appwrite.module';

@Module({})
export class UsersModule {
  imports: [AppwriteModule];
}
