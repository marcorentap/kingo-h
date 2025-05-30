import { Injectable } from '@nestjs/common';
import { AppwriteException, Models } from 'node-appwrite';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { CommentDto } from './comment.dto';

@Injectable()
export class CommentsService {
  constructor(readonly appwriteService: AppwriteService) {}

  commentDocToDto(doc: Models.Document) {
    return new CommentDto({
      id: doc['$id'],
      user: doc['user'],
      comment: doc['comment'],
      listing: doc['listing'],
    });
  }

  async getComment(id: string) {
    return await this.appwriteService.getComment(id);
  }
}
