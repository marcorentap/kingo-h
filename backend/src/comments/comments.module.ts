import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { AppwriteModule } from 'src/appwrite/appwrite.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [CommentsService],
  controllers: [CommentsController],
  imports: [AppwriteModule, JwtModule],
})
export class CommentsModule {}
